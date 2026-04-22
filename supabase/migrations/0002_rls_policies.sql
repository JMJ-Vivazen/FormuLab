-- FormuLab Row-Level Security policies
-- Philosophy: this is an internal tool. Any authenticated user (which is
-- already gated to @vivazen.com by handle_new_user) can read and write all
-- business data. Profiles are readable by all authenticated users; only the
-- owner can update their own profile row.
-- Apply this in Supabase Dashboard → SQL Editor AFTER 0001_initial_schema.sql

-- Enable RLS on every table
alter table profiles enable row level security;
alter table projects enable row level security;
alter table formulations enable row level security;
alter table samples enable row level security;
alter table sample_recipients enable row level security;
alter table feedback enable row level security;
alter table gate_reviews enable row level security;
alter table materials enable row level security;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create policy "profiles readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
create policy "projects readable by authenticated"
  on projects for select to authenticated using (true);
create policy "projects insertable by authenticated"
  on projects for insert to authenticated with check (true);
create policy "projects updatable by authenticated"
  on projects for update to authenticated using (true) with check (true);
create policy "projects deletable by authenticated"
  on projects for delete to authenticated using (true);

-- ------------------------------------------------------------
-- FORMULATIONS
-- ------------------------------------------------------------
create policy "formulations readable by authenticated"
  on formulations for select to authenticated using (true);
create policy "formulations insertable by authenticated"
  on formulations for insert to authenticated with check (true);
create policy "formulations updatable by authenticated"
  on formulations for update to authenticated using (true) with check (true);
create policy "formulations deletable by authenticated"
  on formulations for delete to authenticated using (true);

-- ------------------------------------------------------------
-- SAMPLES
-- ------------------------------------------------------------
create policy "samples readable by authenticated"
  on samples for select to authenticated using (true);
create policy "samples insertable by authenticated"
  on samples for insert to authenticated with check (true);
create policy "samples updatable by authenticated"
  on samples for update to authenticated using (true) with check (true);
create policy "samples deletable by authenticated"
  on samples for delete to authenticated using (true);

-- ------------------------------------------------------------
-- SAMPLE RECIPIENTS
-- ------------------------------------------------------------
create policy "sample_recipients readable by authenticated"
  on sample_recipients for select to authenticated using (true);
create policy "sample_recipients insertable by authenticated"
  on sample_recipients for insert to authenticated with check (true);
create policy "sample_recipients updatable by authenticated"
  on sample_recipients for update to authenticated using (true) with check (true);
create policy "sample_recipients deletable by authenticated"
  on sample_recipients for delete to authenticated using (true);

-- ------------------------------------------------------------
-- FEEDBACK
-- ------------------------------------------------------------
create policy "feedback readable by authenticated"
  on feedback for select to authenticated using (true);
create policy "feedback insertable by authenticated"
  on feedback for insert to authenticated with check (true);
create policy "feedback updatable by authenticated"
  on feedback for update to authenticated using (true) with check (true);
create policy "feedback deletable by authenticated"
  on feedback for delete to authenticated using (true);

-- ------------------------------------------------------------
-- GATE REVIEWS
-- ------------------------------------------------------------
create policy "gate_reviews readable by authenticated"
  on gate_reviews for select to authenticated using (true);
create policy "gate_reviews insertable by authenticated"
  on gate_reviews for insert to authenticated with check (true);
create policy "gate_reviews updatable by authenticated"
  on gate_reviews for update to authenticated using (true) with check (true);
create policy "gate_reviews deletable by authenticated"
  on gate_reviews for delete to authenticated using (true);

-- ------------------------------------------------------------
-- MATERIALS
-- ------------------------------------------------------------
create policy "materials readable by authenticated"
  on materials for select to authenticated using (true);
create policy "materials insertable by authenticated"
  on materials for insert to authenticated with check (true);
create policy "materials updatable by authenticated"
  on materials for update to authenticated using (true) with check (true);
create policy "materials deletable by authenticated"
  on materials for delete to authenticated using (true);
