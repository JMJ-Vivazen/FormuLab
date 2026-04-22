import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Search, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ScoreRing } from '../components/ScoreRing'
import { FeedbackRadar } from '../components/FeedbackRadar'
import { format } from 'date-fns'

export function FeedbackList() {
  const { feedback, formulations, projects } = useStore()
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  const filtered = feedback.filter((fb) => {
    const form = formulations.find((f) => f.id === fb.formulationId)
    const proj = projects.find((p) => p.id === fb.projectId)
    const matchSearch =
      fb.reviewerName.toLowerCase().includes(search.toLowerCase()) ||
      form?.name.toLowerCase().includes(search.toLowerCase()) ||
      proj?.name.toLowerCase().includes(search.toLowerCase())
    const matchProject = projectFilter === 'all' || fb.projectId === projectFilter
    return matchSearch && matchProject
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const avgScore = filtered.length
    ? (filtered.reduce((s, f) => s + f.overallScore, 0) / filtered.length).toFixed(1) : '—'
  const needsRevision = filtered.filter((f) => f.recommendReformulation).length

  const ATTRS = ['taste', 'aroma', 'appearance', 'texture', 'aftertaste', 'overall']

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>
        <p className="text-slate-400 mt-1">{feedback.length} total responses</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{avgScore}</div>
            <div className="text-sm text-slate-400">Avg overall score</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{needsRevision}</div>
            <div className="text-sm text-slate-400">Flagged for revision</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{filtered.length - needsRevision}</div>
            <div className="text-sm text-slate-400">Positive responses</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Overall Sensory</h3>
          <p className="text-xs text-slate-400 mb-2">All filtered feedback</p>
          <FeedbackRadar feedbackList={filtered} />
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search feedback…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select
              value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
            {filtered.map((fb) => {
              const form = formulations.find((f) => f.id === fb.formulationId)
              const project = projects.find((p) => p.id === fb.projectId)

              return (
                <div key={fb.id} className="bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{fb.reviewerName}</span>
                        <span className="text-xs text-slate-400">· {fb.reviewerRole}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Link to={`/projects/${project?.id}`} className="text-xs text-indigo-500 hover:underline">{project?.name}</Link>
                        <span className="text-xs text-slate-300">·</span>
                        <Link to={`/formulations/${form?.id}`} className="text-xs text-slate-400 hover:text-indigo-500">{form?.versionLabel} {form?.name}</Link>
                        <span className="text-xs text-slate-300">· {format(new Date(fb.date), 'MMM d')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {fb.recommendReformulation && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium flex items-center gap-1">
                          <AlertCircle size={10} /> Needs revision
                        </span>
                      )}
                      <ScoreRing score={fb.overallScore} size={40} />
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {ATTRS.map((attr) => {
                      const val = fb.ratings[attr]
                      if (val == null) return null
                      const pct = val / 10
                      const color = pct >= 0.7 ? 'text-green-600' : pct >= 0.5 ? 'text-amber-500' : 'text-red-500'
                      return (
                        <span key={attr} className="text-xs bg-slate-50 rounded-lg px-2 py-1 text-slate-500">
                          {attr} <span className={`font-semibold ${color}`}>{val}</span>
                        </span>
                      )
                    })}
                  </div>

                  {(fb.positives || fb.negatives || fb.suggestions) && (
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs">
                      {fb.positives && <p className="text-green-700 bg-green-50 rounded-lg p-2">✓ {fb.positives}</p>}
                      {fb.negatives && <p className="text-red-700 bg-red-50 rounded-lg p-2">✗ {fb.negatives}</p>}
                      {fb.suggestions && <p className="text-blue-700 bg-blue-50 rounded-lg p-2">→ {fb.suggestions}</p>}
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <MessageSquare size={28} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feedback found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
