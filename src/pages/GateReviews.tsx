import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { GitMerge, Search, CheckCircle, AlertCircle, XCircle, RotateCcw, Clock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { format } from 'date-fns'
import type { GateDecision, GateStage } from '../types'

const GATE_STAGES: GateStage[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6']

const DECISION_ICONS: Record<GateDecision, ReactElement> = {
  'GO':                <CheckCircle size={16} className="text-green-500" />,
  'GO with Conditions':<AlertCircle size={16} className="text-amber-500" />,
  'HOLD':              <XCircle size={16} className="text-red-500" />,
  'RECYCLE':           <RotateCcw size={16} className="text-orange-500" />,
  pending:             <Clock size={16} className="text-slate-400" />,
}

export function GateReviews() {
  const { gateReviews, projects } = useStore()
  const [search, setSearch] = useState('')
  const [decisionFilter, setDecisionFilter] = useState<GateDecision | 'all'>('all')
  const [gateFilter, setGateFilter] = useState<GateStage | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const filtered = gateReviews
    .filter((g) => {
      const proj = projects.find((p) => p.id === g.projectId)
      const matchSearch =
        (proj?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (proj?.projectCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
        g.gate.toLowerCase().includes(search.toLowerCase())
      const matchDecision = decisionFilter === 'all' || g.decision === decisionFilter
      const matchGate = gateFilter === 'all' || g.gate === gateFilter
      const matchProject = projectFilter === 'all' || g.projectId === projectFilter
      return matchSearch && matchDecision && matchGate && matchProject
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const goCount = gateReviews.filter((g) => g.decision === 'GO').length
  const conditionsCount = gateReviews.filter((g) => g.decision === 'GO with Conditions').length
  const holdCount = gateReviews.filter((g) => g.decision === 'HOLD').length
  const recycleCount = gateReviews.filter((g) => g.decision === 'RECYCLE').length

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gate Reviews</h1>
        <p className="text-slate-400 mt-1">All gate decisions across projects — QA-governed stage-gate control</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'GO', value: goCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'GO w/ Conditions', value: conditionsCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'HOLD', value: holdCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'RECYCLE', value: recycleCount, icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gate pass rate by stage */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">Gate Pass Rate by Stage</h2>
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {GATE_STAGES.map((stage) => {
            const stageReviews = gateReviews.filter((g) => g.gate === stage)
            const passCount = stageReviews.filter((g) => g.decision === 'GO' || g.decision === 'GO with Conditions').length
            const pct = stageReviews.length ? Math.round((passCount / stageReviews.length) * 100) : null
            return (
              <div key={stage} className="px-3 py-4 text-center">
                <div className="text-xs font-bold text-slate-600 mb-1">{stage}</div>
                <div className="text-xl font-bold text-slate-800 mb-1">{stageReviews.length}</div>
                {pct !== null ? (
                  <div className={`text-xs font-medium ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {pct}% pass
                  </div>
                ) : (
                  <div className="text-xs text-slate-300">—</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(['all', 'G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGateFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${gateFilter === g ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {g === 'all' ? 'All Gates' : g}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'GO', 'GO with Conditions', 'HOLD', 'RECYCLE'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDecisionFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${decisionFilter === d ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {d === 'all' ? 'All Decisions' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Gate Review List */}
      <div className="space-y-3">
        {filtered.map((gate) => {
          const proj = projects.find((p) => p.id === gate.projectId)
          return (
            <div key={gate.id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {DECISION_ICONS[gate.decision]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-800">{gate.gate}</span>
                      <StatusBadge status={gate.decision} />
                      {proj && (
                        <Link to={`/projects/${proj.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                          {proj.name}
                        </Link>
                      )}
                      {proj && <span className="text-xs font-mono text-slate-400">{proj.projectCode}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {gate.actualDate && format(new Date(gate.actualDate), 'MMM d, yyyy')}
                      {gate.reviewers && ` · ${gate.reviewers}`}
                    </p>
                    {gate.evidenceNotes && (
                      <p className="text-sm text-slate-600 mt-1.5">{gate.evidenceNotes}</p>
                    )}
                    {gate.conditions && (
                      <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">Condition</p>
                        <p className="text-sm text-amber-900">{gate.conditions}</p>
                        {gate.conditionOwner && (
                          <p className="text-xs text-amber-600 mt-1">
                            Owner: {gate.conditionOwner}
                            {gate.conditionDueDate && ` · Due ${format(new Date(gate.conditionDueDate), 'MMM d, yyyy')}`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {proj && (
                  <Link to={`/projects/${proj.id}`} className="text-xs text-indigo-500 hover:text-indigo-700 shrink-0 ml-3">
                    View project →
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <GitMerge size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No gate reviews found</p>
            <p className="text-sm mt-1">Record gate decisions from a project detail page</p>
          </div>
        )}
      </div>
    </div>
  )
}
