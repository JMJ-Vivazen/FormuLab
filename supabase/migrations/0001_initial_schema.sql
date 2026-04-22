-- FormuLab initial schema
-- Apply this in Supabase Dashboard → SQL Editor → New Query

-- ============================================================
-- ENUMS
-- ============================================================
create type project_status as enum ('active', 'on-hold', 'completed');
create type gate_stage as enum ('G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'archived');
create type gate_decision as enum ('GO', 'GO with Conditions', 'HOLD', 'RECYCLE', 'pending');
create type formulation_status as enum ('draft', 'in-testing', 'approved', 'rejected', 'archived');
create type sample_class as enum ('A', 'B', 'C');
create type sample_status as enum ('produced', 'distributed', 'in-review', 'feedback-complete');
create type sample_lifecycle_status as enum (
  'requested', 'pending-assignment', 'assigned', 'labeled', 'quarantine',
  'released', 'in-storage', 'in-transit', 'at-recipient', 'at-review-date',
  'extended', 'consumed', 'returned', 'destroyed', 'closed'
);
create type priority_level as enum ('low', 'medium', 'high', 'critical');
create type coa_status as enum ('pending', 'received', 'approved', 'rejected');

-- ============================================================
-- HELPERS
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  name text not null,
  category text not null default '',
  description text not null default '',
  target_profile text not null default '',
  status project_status not null default 'active',
  stage gate_stage not null default 'G0',
  priority priority_level not null default 'medium',
  owner text not null default '',
  cmo text,
  formula_frozen boolean not null default false,
  qtpp text,
  target_actives text,
  shelf_life_target text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_stage_idx on projects(stage);
create index projects_status_idx on projects(status);
create trigger projects_updated_at before update on projects
  for each row execute function set_updated_at();

-- ============================================================
-- FORMULATIONS
-- ============================================================
create table formulations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  parent_id uuid references formulations(id) on delete set null,
  version_number integer not null,
  version_label text not null,
  name text not null,
  ingredients jsonb not null default '[]'::jsonb,
  process_notes text not null default '',
  target_profile text not null default '',
  status formulation_status not null default 'draft',
  frozen boolean not null default false,
  change_log text not null default '',
  label_impact text,
  risk_notes text,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index formulations_project_id_idx on formulations(project_id);
create index formulations_parent_id_idx on formulations(parent_id);
create trigger formulations_updated_at before update on formulations
  for each row execute function set_updated_at();

-- ============================================================
-- SAMPLES
-- ============================================================
create table samples (
  id uuid primary key default gen_random_uuid(),
  formulation_id uuid not null references formulations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  batch_code text not null,
  rsln text,
  sample_class sample_class not null default 'B',
  lifecycle_status sample_lifecycle_status not null default 'requested',
  date_produced date,
  quantity numeric not null default 0,
  quantity_unit text not null default '',
  status sample_status not null default 'produced',
  intended_use text,
  storage_condition text,
  site text,
  external_distribution boolean not null default false,
  ingestion_possible boolean not null default false,
  notes text not null default '',
  expiry_date date,
  disposition_date date,
  disposition_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index samples_formulation_id_idx on samples(formulation_id);
create index samples_project_id_idx on samples(project_id);
create trigger samples_updated_at before update on samples
  for each row execute function set_updated_at();

-- ============================================================
-- SAMPLE RECIPIENTS (normalized out of Sample.recipients array)
-- ============================================================
create table sample_recipients (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references samples(id) on delete cascade,
  name text not null,
  role text not null default '',
  date_sent date,
  feedback_received boolean not null default false,
  created_at timestamptz not null default now()
);
create index sample_recipients_sample_id_idx on sample_recipients(sample_id);

-- ============================================================
-- FEEDBACK
-- ============================================================
create table feedback (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references samples(id) on delete cascade,
  formulation_id uuid not null references formulations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  reviewer_name text not null,
  reviewer_role text not null default '',
  date timestamptz not null default now(),
  ratings jsonb not null default '{}'::jsonb,
  overall_score numeric not null default 0,
  positives text not null default '',
  negatives text not null default '',
  suggestions text not null default '',
  recommend_reformulation boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index feedback_sample_id_idx on feedback(sample_id);
create index feedback_formulation_id_idx on feedback(formulation_id);
create index feedback_project_id_idx on feedback(project_id);
create trigger feedback_updated_at before update on feedback
  for each row execute function set_updated_at();

-- ============================================================
-- GATE REVIEWS
-- ============================================================
create table gate_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  gate gate_stage not null,
  planned_date date,
  actual_date date,
  reviewers text not null default '',
  decision gate_decision not null default 'pending',
  conditions text,
  condition_owner text,
  condition_due_date date,
  evidence_notes text,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gate_reviews_project_id_idx on gate_reviews(project_id);
create trigger gate_reviews_updated_at before update on gate_reviews
  for each row execute function set_updated_at();

-- ============================================================
-- MATERIALS (master data, no FK to projects)
-- ============================================================
create table materials (
  id uuid primary key default gen_random_uuid(),
  material_code text not null unique,
  name text not null,
  supplier text not null default '',
  category text not null default '',
  coa_status coa_status not null default 'pending',
  rd_approved boolean not null default false,
  commercial_ready boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index materials_coa_status_idx on materials(coa_status);
create trigger materials_updated_at before update on materials
  for each row execute function set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP + ENFORCE @vivazen.com ALLOWLIST
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email not ilike '%@vivazen.com'
     and new.email not ilike '%@elevationcapital.vc' then
    raise exception 'Email domain not permitted';
  end if;
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
