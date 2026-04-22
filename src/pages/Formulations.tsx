import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Search, ChevronRight, GitBranch } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreRing } from '../components/ScoreRing'
import type { FormulationStatus } from '../types'
import { format } from 'date-fns'

export function Formulations() {
  const { formulations, projects, feedback } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FormulationStatus | 'all'>('all')

  const filtered = formulations
    .filter((f) => {
      const proj = projects.find((p) => p.id === f.projectId)
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.versionLabel.toLowerCase().includes(search.toLowerCase()) ||
        proj?.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || f.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Formulations</h1>
        <p className="text-slate-400 mt-1">{formulations.length} total formulations across {projects.length} projects</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search formulations…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'draft', 'in-testing', 'approved', 'rejected', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((form) => {
          const project = projects.find((p) => p.id === form.projectId)
          const formFeedback = feedback.filter((f) => f.formulationId === form.id)
          const avgScore = formFeedback.length
            ? formFeedback.reduce((s, f) => s + f.overallScore, 0) / formFeedback.length : 0

          return (
            <Link
              key={form.id}
              to={`/formulations/${form.id}`}
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {form.versionLabel}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{form.name}</span>
                  <StatusBadge status={form.status} />
                  {form.parentId && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <GitBranch size={11} />
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{project?.name} · {format(new Date(form.createdAt), 'MMM d, yyyy')}</p>
                {form.changeLog && <p className="text-xs text-slate-400 mt-0.5 truncate italic">{form.changeLog}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {avgScore > 0 && <ScoreRing score={parseFloat(avgScore.toFixed(1))} size={44} />}
                <span className="text-xs text-slate-400">{formFeedback.length} feedback</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <FlaskConical size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No formulations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
