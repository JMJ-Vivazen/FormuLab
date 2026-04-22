import { useState, useMemo } from 'react'
import { Download, Search } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'
import type {
  Project, Formulation, Sample, Feedback, GateReview, Material,
  ProjectStatus, GateStage, Priority, FormulationStatus, SampleClass,
  SampleLifecycleStatus, GateDecision, CoaStatus,
} from '../types'

type EntityKey = 'projects' | 'formulations' | 'samples' | 'feedback' | 'gateReviews' | 'materials'

const ENTITIES: { key: EntityKey; label: string }[] = [
  { key: 'projects',     label: 'Projects' },
  { key: 'formulations', label: 'Formulations' },
  { key: 'samples',      label: 'Samples' },
  { key: 'feedback',     label: 'Feedback' },
  { key: 'gateReviews',  label: 'Gate Reviews' },
  { key: 'materials',    label: 'Materials' },
]

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: string; label: string }[]): string {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'string' ? v : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = columns.map(c => esc(c.label)).join(',')
  const body = rows.map(r => columns.map(c => esc(r[c.key])).join(',')).join('\n')
  return header + '\n' + body
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function fmtDate(v?: string): string {
  if (!v) return ''
  const d = new Date(v)
  return isNaN(d.getTime()) ? v : format(d, 'yyyy-MM-dd')
}

// ---------- ROW SHAPERS ----------
// Each shaper projects a domain entity into a flat object suitable for CSV/table.

function shapeProjects(items: Project[]) {
  return items.map(p => ({
    projectCode: p.projectCode,
    name: p.name,
    category: p.category,
    status: p.status,
    stage: p.stage,
    priority: p.priority,
    owner: p.owner,
    cmo: p.cmo ?? '',
    formulaFrozen: p.formulaFrozen ? 'yes' : 'no',
    description: p.description,
    targetProfile: p.targetProfile,
    createdAt: fmtDate(p.createdAt),
    updatedAt: fmtDate(p.updatedAt),
  }))
}
const PROJECT_COLS = [
  { key: 'projectCode', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'stage', label: 'Stage' },
  { key: 'priority', label: 'Priority' },
  { key: 'owner', label: 'Owner' },
  { key: 'cmo', label: 'CMO' },
  { key: 'formulaFrozen', label: 'Frozen' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
]

function shapeFormulations(items: Formulation[], projects: Project[]) {
  const byId = new Map(projects.map(p => [p.id, p]))
  return items.map(f => {
    const p = byId.get(f.projectId)
    return {
      projectCode: p?.projectCode ?? '',
      projectName: p?.name ?? '',
      versionLabel: f.versionLabel,
      name: f.name,
      status: f.status,
      frozen: f.frozen ? 'yes' : 'no',
      ingredientCount: f.ingredients.length,
      createdBy: f.createdBy,
      createdAt: fmtDate(f.createdAt),
    }
  })
}
const FORMULATION_COLS = [
  { key: 'projectCode', label: 'Project' },
  { key: 'projectName', label: 'Project Name' },
  { key: 'versionLabel', label: 'Version' },
  { key: 'name', label: 'Formulation' },
  { key: 'status', label: 'Status' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'ingredientCount', label: 'Ingredients' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created' },
]

function shapeSamples(items: Sample[], projects: Project[], formulations: Formulation[]) {
  const pById = new Map(projects.map(p => [p.id, p]))
  const fById = new Map(formulations.map(f => [f.id, f]))
  return items.map(s => {
    const p = pById.get(s.projectId)
    const f = fById.get(s.formulationId)
    return {
      batchCode: s.batchCode,
      projectCode: p?.projectCode ?? '',
      formulation: f ? `${f.versionLabel} — ${f.name}` : '',
      sampleClass: s.sampleClass,
      lifecycleStatus: s.lifecycleStatus,
      status: s.status,
      dateProduced: fmtDate(s.dateProduced),
      quantity: `${s.quantity} ${s.quantityUnit}`,
      recipients: s.recipients.map(r => r.name).join('; '),
      externalDistribution: s.externalDistribution ? 'yes' : 'no',
      expiryDate: fmtDate(s.expiryDate),
      notes: s.notes,
    }
  })
}
const SAMPLE_COLS = [
  { key: 'batchCode', label: 'Batch Code' },
  { key: 'projectCode', label: 'Project' },
  { key: 'formulation', label: 'Formulation' },
  { key: 'sampleClass', label: 'Class' },
  { key: 'lifecycleStatus', label: 'Lifecycle' },
  { key: 'status', label: 'Status' },
  { key: 'dateProduced', label: 'Produced' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'recipients', label: 'Recipients' },
  { key: 'externalDistribution', label: 'External' },
  { key: 'expiryDate', label: 'Expiry' },
]

function shapeFeedback(items: Feedback[], projects: Project[], samples: Sample[]) {
  const pById = new Map(projects.map(p => [p.id, p]))
  const sById = new Map(samples.map(s => [s.id, s]))
  return items.map(fb => {
    const p = pById.get(fb.projectId)
    const s = sById.get(fb.sampleId)
    const r = fb.ratings ?? {}
    return {
      date: fmtDate(fb.date),
      projectCode: p?.projectCode ?? '',
      batchCode: s?.batchCode ?? '',
      reviewerName: fb.reviewerName,
      reviewerRole: fb.reviewerRole,
      overallScore: fb.overallScore,
      taste: r.taste ?? '',
      aroma: r.aroma ?? '',
      appearance: r.appearance ?? '',
      texture: r.texture ?? '',
      aftertaste: r.aftertaste ?? '',
      positives: fb.positives,
      negatives: fb.negatives,
      suggestions: fb.suggestions,
      recommendReformulation: fb.recommendReformulation ? 'yes' : 'no',
    }
  })
}
const FEEDBACK_COLS = [
  { key: 'date', label: 'Date' },
  { key: 'projectCode', label: 'Project' },
  { key: 'batchCode', label: 'Batch' },
  { key: 'reviewerName', label: 'Reviewer' },
  { key: 'reviewerRole', label: 'Role' },
  { key: 'overallScore', label: 'Score' },
  { key: 'taste', label: 'Taste' },
  { key: 'aroma', label: 'Aroma' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'texture', label: 'Texture' },
  { key: 'aftertaste', label: 'Aftertaste' },
  { key: 'positives', label: 'Positives' },
  { key: 'negatives', label: 'Negatives' },
  { key: 'suggestions', label: 'Suggestions' },
  { key: 'recommendReformulation', label: 'Reformulate?' },
]

function shapeGateReviews(items: GateReview[], projects: Project[]) {
  const byId = new Map(projects.map(p => [p.id, p]))
  return items.map(g => {
    const p = byId.get(g.projectId)
    return {
      projectCode: p?.projectCode ?? '',
      projectName: p?.name ?? '',
      gate: g.gate,
      decision: g.decision,
      plannedDate: fmtDate(g.plannedDate),
      actualDate: fmtDate(g.actualDate),
      reviewers: g.reviewers,
      conditions: g.conditions ?? '',
      conditionOwner: g.conditionOwner ?? '',
      conditionDueDate: fmtDate(g.conditionDueDate),
    }
  })
}
const GATE_REVIEW_COLS = [
  { key: 'projectCode', label: 'Project' },
  { key: 'projectName', label: 'Project Name' },
  { key: 'gate', label: 'Gate' },
  { key: 'decision', label: 'Decision' },
  { key: 'plannedDate', label: 'Planned' },
  { key: 'actualDate', label: 'Actual' },
  { key: 'reviewers', label: 'Reviewers' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'conditionOwner', label: 'Cond. Owner' },
  { key: 'conditionDueDate', label: 'Cond. Due' },
]

function shapeMaterials(items: Material[]) {
  return items.map(m => ({
    materialCode: m.materialCode,
    name: m.name,
    supplier: m.supplier,
    category: m.category,
    coaStatus: m.coaStatus,
    rdApproved: m.rdApproved ? 'yes' : 'no',
    commercialReady: m.commercialReady ? 'yes' : 'no',
    notes: m.notes ?? '',
    lastUpdated: fmtDate(m.lastUpdated),
  }))
}
const MATERIAL_COLS = [
  { key: 'materialCode', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'category', label: 'Category' },
  { key: 'coaStatus', label: 'COA' },
  { key: 'rdApproved', label: 'R&D Approved' },
  { key: 'commercialReady', label: 'Commercial' },
  { key: 'lastUpdated', label: 'Updated' },
]

// ---------- PAGE ----------

export function Reports() {
  const { projects, formulations, samples, feedback, gateReviews, materials } = useStore()
  const [entity, setEntity] = useState<EntityKey>('projects')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | 'all'>('all')
  const [stage, setStage] = useState<GateStage | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [formulationStatus, setFormulationStatus] = useState<FormulationStatus | 'all'>('all')
  const [sampleClassFilter, setSampleClassFilter] = useState<SampleClass | 'all'>('all')
  const [lifecycle, setLifecycle] = useState<SampleLifecycleStatus | 'all'>('all')
  const [decision, setDecision] = useState<GateDecision | 'all'>('all')
  const [coa, setCoa] = useState<CoaStatus | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const inRange = (value?: string) => {
    if (!fromDate && !toDate) return true
    if (!value) return false
    const t = new Date(value).getTime()
    if (isNaN(t)) return false
    if (fromDate && t < new Date(fromDate).getTime()) return false
    if (toDate && t > new Date(toDate).getTime() + 86_400_000 - 1) return false
    return true
  }
  const matchSearch = (text: string) => !search || text.toLowerCase().includes(search.toLowerCase())

  const { rows, columns } = useMemo<{ rows: Record<string, unknown>[]; columns: { key: string; label: string }[] }>(() => {
    switch (entity) {
      case 'projects': {
        const filtered = projects.filter(p =>
          matchSearch(`${p.projectCode} ${p.name} ${p.owner} ${p.category}`) &&
          (projectStatus === 'all' || p.status === projectStatus) &&
          (stage === 'all' || p.stage === stage) &&
          (priority === 'all' || p.priority === priority) &&
          inRange(p.createdAt)
        )
        return { rows: shapeProjects(filtered), columns: PROJECT_COLS }
      }
      case 'formulations': {
        const filtered = formulations.filter(f =>
          matchSearch(`${f.name} ${f.versionLabel} ${f.createdBy}`) &&
          (projectFilter === 'all' || f.projectId === projectFilter) &&
          (formulationStatus === 'all' || f.status === formulationStatus) &&
          inRange(f.createdAt)
        )
        return { rows: shapeFormulations(filtered, projects), columns: FORMULATION_COLS }
      }
      case 'samples': {
        const filtered = samples.filter(s =>
          matchSearch(`${s.batchCode} ${s.notes} ${s.intendedUse ?? ''}`) &&
          (projectFilter === 'all' || s.projectId === projectFilter) &&
          (sampleClassFilter === 'all' || s.sampleClass === sampleClassFilter) &&
          (lifecycle === 'all' || s.lifecycleStatus === lifecycle) &&
          inRange(s.dateProduced)
        )
        return { rows: shapeSamples(filtered, projects, formulations), columns: SAMPLE_COLS }
      }
      case 'feedback': {
        const filtered = feedback.filter(fb =>
          matchSearch(`${fb.reviewerName} ${fb.positives} ${fb.negatives} ${fb.suggestions}`) &&
          (projectFilter === 'all' || fb.projectId === projectFilter) &&
          inRange(fb.date)
        )
        return { rows: shapeFeedback(filtered, projects, samples), columns: FEEDBACK_COLS }
      }
      case 'gateReviews': {
        const filtered = gateReviews.filter(g =>
          matchSearch(`${g.reviewers} ${g.conditions ?? ''}`) &&
          (projectFilter === 'all' || g.projectId === projectFilter) &&
          (stage === 'all' || g.gate === stage) &&
          (decision === 'all' || g.decision === decision) &&
          inRange(g.actualDate ?? g.plannedDate)
        )
        return { rows: shapeGateReviews(filtered, projects), columns: GATE_REVIEW_COLS }
      }
      case 'materials': {
        const filtered = materials.filter(m =>
          matchSearch(`${m.materialCode} ${m.name} ${m.supplier} ${m.category}`) &&
          (coa === 'all' || m.coaStatus === coa)
        )
        return { rows: shapeMaterials(filtered), columns: MATERIAL_COLS }
      }
    }
  }, [entity, projects, formulations, samples, feedback, gateReviews, materials,
      search, projectFilter, projectStatus, stage, priority, formulationStatus,
      sampleClassFilter, lifecycle, decision, coa, fromDate, toDate])

  const exportCsv = () => {
    const name = `formulab_${entity}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    download(name, toCsv(rows, columns))
  }

  const resetFilters = () => {
    setSearch('')
    setProjectFilter('all')
    setProjectStatus('all')
    setStage('all')
    setPriority('all')
    setFormulationStatus('all')
    setSampleClassFilter('all')
    setLifecycle('all')
    setDecision('all')
    setCoa('all')
    setFromDate('')
    setToDate('')
  }

  const selectCls = 'border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-white'

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Filter and export data as CSV for Excel or other analysis tools.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Export CSV ({rows.length})
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {ENTITIES.map(e => (
          <button
            key={e.key}
            onClick={() => { setEntity(e.key); resetFilters() }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              entity === e.key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm w-56 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          />
        </div>

        {(entity === 'formulations' || entity === 'samples' || entity === 'feedback' || entity === 'gateReviews') && (
          <select className={selectCls} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="all">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} — {p.name}</option>)}
          </select>
        )}

        {entity === 'projects' && (
          <>
            <select className={selectCls} value={projectStatus} onChange={e => setProjectStatus(e.target.value as ProjectStatus | 'all')}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
              <option value="completed">Completed</option>
            </select>
            <select className={selectCls} value={stage} onChange={e => setStage(e.target.value as GateStage | 'all')}>
              <option value="all">All stages</option>
              {(['G0','G1','G2','G3','G4','G5','G6'] as GateStage[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className={selectCls} value={priority} onChange={e => setPriority(e.target.value as Priority | 'all')}>
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </>
        )}

        {entity === 'formulations' && (
          <select className={selectCls} value={formulationStatus} onChange={e => setFormulationStatus(e.target.value as FormulationStatus | 'all')}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="in-testing">In testing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        )}

        {entity === 'samples' && (
          <>
            <select className={selectCls} value={sampleClassFilter} onChange={e => setSampleClassFilter(e.target.value as SampleClass | 'all')}>
              <option value="all">All classes</option>
              <option value="A">Class A</option>
              <option value="B">Class B</option>
              <option value="C">Class C</option>
            </select>
            <select className={selectCls} value={lifecycle} onChange={e => setLifecycle(e.target.value as SampleLifecycleStatus | 'all')}>
              <option value="all">All lifecycles</option>
              {(['requested','pending-assignment','assigned','labeled','quarantine','released','in-storage','in-transit','at-recipient','at-review-date','extended','consumed','returned','destroyed','closed'] as SampleLifecycleStatus[]).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </>
        )}

        {entity === 'gateReviews' && (
          <>
            <select className={selectCls} value={stage} onChange={e => setStage(e.target.value as GateStage | 'all')}>
              <option value="all">All gates</option>
              {(['G0','G1','G2','G3','G4','G5','G6'] as GateStage[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className={selectCls} value={decision} onChange={e => setDecision(e.target.value as GateDecision | 'all')}>
              <option value="all">All decisions</option>
              <option value="GO">GO</option>
              <option value="GO with Conditions">GO with Conditions</option>
              <option value="HOLD">HOLD</option>
              <option value="RECYCLE">RECYCLE</option>
              <option value="pending">Pending</option>
            </select>
          </>
        )}

        {entity === 'materials' && (
          <select className={selectCls} value={coa} onChange={e => setCoa(e.target.value as CoaStatus | 'all')}>
            <option value="all">All COA statuses</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}

        {entity !== 'materials' && (
          <>
            <input type="date" className={selectCls} value={fromDate} onChange={e => setFromDate(e.target.value)} title="From date" />
            <input type="date" className={selectCls} value={toDate} onChange={e => setToDate(e.target.value)} title="To date" />
          </>
        )}

        <button onClick={resetFilters} className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2">
          Reset
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map(c => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No rows match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-2.5 text-slate-700 whitespace-nowrap max-w-xs truncate" title={String(r[c.key] ?? '')}>
                        {String(r[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
