import type { FormulationStatus, ProjectStatus, SampleStatus, GateStage, GateDecision, SampleClass, SampleLifecycleStatus, Priority } from '../types'

type Status = FormulationStatus | ProjectStatus | SampleStatus | GateStage | GateDecision | SampleClass | SampleLifecycleStatus | Priority | string

const config: Record<string, { label: string; classes: string }> = {
  // Project status
  active:              { label: 'Active',              classes: 'bg-indigo-100 text-indigo-700' },
  'on-hold':           { label: 'On Hold',             classes: 'bg-amber-100 text-amber-700' },
  completed:           { label: 'Completed',           classes: 'bg-green-100 text-green-700' },
  // Formulation status
  draft:               { label: 'Draft',               classes: 'bg-slate-100 text-slate-600' },
  'in-testing':        { label: 'In Testing',          classes: 'bg-blue-100 text-blue-700' },
  approved:            { label: 'Approved',            classes: 'bg-green-100 text-green-700' },
  rejected:            { label: 'Rejected',            classes: 'bg-red-100 text-red-700' },
  archived:            { label: 'Archived',            classes: 'bg-gray-100 text-gray-500' },
  // Sample status (legacy)
  produced:            { label: 'Produced',            classes: 'bg-slate-100 text-slate-600' },
  distributed:         { label: 'Distributed',         classes: 'bg-blue-100 text-blue-700' },
  'in-review':         { label: 'In Review',           classes: 'bg-purple-100 text-purple-700' },
  'feedback-complete': { label: 'Complete',            classes: 'bg-green-100 text-green-700' },
  // Gate stages
  G0:                  { label: 'G0 — Intake',         classes: 'bg-slate-100 text-slate-700' },
  G1:                  { label: 'G1 — Feasibility',    classes: 'bg-blue-100 text-blue-700' },
  G2:                  { label: 'G2 — Design Inputs',  classes: 'bg-cyan-100 text-cyan-700' },
  G3:                  { label: 'G3 — Prototype',      classes: 'bg-violet-100 text-violet-700' },
  G4:                  { label: 'G4 — Freeze',         classes: 'bg-amber-100 text-amber-700' },
  G5:                  { label: 'G5 — Tech Transfer',  classes: 'bg-orange-100 text-orange-700' },
  G6:                  { label: 'G6 — Launch Ready',   classes: 'bg-green-100 text-green-700' },
  // Gate decisions
  'GO':                { label: 'GO',                  classes: 'bg-green-100 text-green-700' },
  'GO with Conditions':{ label: 'GO w/ Conditions',    classes: 'bg-amber-100 text-amber-700' },
  'HOLD':              { label: 'HOLD',                classes: 'bg-red-100 text-red-700' },
  'RECYCLE':           { label: 'RECYCLE',             classes: 'bg-orange-100 text-orange-700' },
  pending:             { label: 'Pending',             classes: 'bg-slate-100 text-slate-500' },
  // Sample class
  A:                   { label: 'Class A',             classes: 'bg-slate-100 text-slate-600' },
  B:                   { label: 'Class B',             classes: 'bg-blue-100 text-blue-700' },
  C:                   { label: 'Class C',             classes: 'bg-orange-100 text-orange-700' },
  // Sample lifecycle
  requested:           { label: 'Requested',           classes: 'bg-slate-100 text-slate-500' },
  'pending-assignment':{ label: 'Pending Assignment',  classes: 'bg-slate-100 text-slate-600' },
  assigned:            { label: 'Assigned',            classes: 'bg-blue-50 text-blue-600' },
  labeled:             { label: 'Labeled',             classes: 'bg-blue-100 text-blue-700' },
  quarantine:          { label: 'Quarantine',          classes: 'bg-amber-100 text-amber-700' },
  released:            { label: 'Released',            classes: 'bg-green-100 text-green-700' },
  'in-storage':        { label: 'In Storage',          classes: 'bg-teal-100 text-teal-700' },
  'in-transit':        { label: 'In Transit',          classes: 'bg-cyan-100 text-cyan-700' },
  'at-recipient':      { label: 'At Recipient',        classes: 'bg-violet-100 text-violet-700' },
  'at-review-date':    { label: 'At Review Date',      classes: 'bg-amber-100 text-amber-700' },
  extended:            { label: 'Extended',            classes: 'bg-yellow-100 text-yellow-700' },
  consumed:            { label: 'Consumed',            classes: 'bg-gray-100 text-gray-500' },
  returned:            { label: 'Returned',            classes: 'bg-slate-100 text-slate-600' },
  destroyed:           { label: 'Destroyed',           classes: 'bg-red-100 text-red-600' },
  closed:              { label: 'Closed',              classes: 'bg-gray-100 text-gray-400' },
  // Priority
  low:                 { label: 'Low',                 classes: 'bg-slate-100 text-slate-500' },
  medium:              { label: 'Medium',              classes: 'bg-blue-100 text-blue-600' },
  high:                { label: 'High',                classes: 'bg-amber-100 text-amber-700' },
  critical:            { label: 'Critical',            classes: 'bg-red-100 text-red-700' },
}

export function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const c = config[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${c.classes}`}>
      {c.label}
    </span>
  )
}
