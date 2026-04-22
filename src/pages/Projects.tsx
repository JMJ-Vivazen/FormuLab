import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FlaskConical, ChevronRight, Search, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreRing } from '../components/ScoreRing'
import { Modal } from '../components/Modal'
import type { ProjectStatus, GateStage, Priority } from '../types'
import { format } from 'date-fns'

const CATEGORIES = ['Functional Beverage', 'Energy Supplement', 'Protein Supplement', 'Snack Food', 'Cosmetic', 'Pharmaceutical', 'Other']
const GATE_STAGES: GateStage[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6']
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']

let projectCounter = 3

function nextProjectCode() {
  projectCounter++
  return `PRJ-${new Date().getFullYear()}-${String(projectCounter).padStart(3, '0')}`
}

export function Projects() {
  const { projects, formulations, feedback, addProject } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [stageFilter, setStageFilter] = useState<GateStage | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    projectCode: nextProjectCode(),
    category: CATEGORIES[0],
    description: '',
    targetProfile: '',
    status: 'active' as ProjectStatus,
    stage: 'G0' as GateStage,
    priority: 'medium' as Priority,
    owner: 'Jonathan',
    cmo: '',
    formulaFrozen: false,
    qtpp: '',
    targetActives: '',
    shelfLifeTarget: '',
  })

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchStage = stageFilter === 'all' || p.stage === stageFilter
    return matchSearch && matchStatus && matchStage
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    addProject(form)
    setForm({
      name: '', projectCode: nextProjectCode(), category: CATEGORIES[0],
      description: '', targetProfile: '', status: 'active', stage: 'G0',
      priority: 'medium', owner: 'Jonathan', cmo: '', formulaFrozen: false,
      qtpp: '', targetActives: '', shelfLifeTarget: '',
    })
    setShowAdd(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} total projects</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'active', 'on-hold', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stageFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All Gates
          </button>
          {GATE_STAGES.map((g) => (
            <button
              key={g}
              onClick={() => setStageFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stageFilter === g ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((proj) => {
          const projForms = formulations.filter((f) => f.projectId === proj.id)
          const latestForm = projForms.sort((a, b) => b.versionNumber - a.versionNumber)[0]
          const projFeedback = feedback.filter((f) => f.projectId === proj.id)
          const avgScore = projFeedback.length
            ? projFeedback.reduce((s, f) => s + f.overallScore, 0) / projFeedback.length : 0

          return (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <FlaskConical size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-400">{proj.projectCode}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusBadge status={proj.priority} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={proj.stage} />
                  {proj.formulaFrozen && (
                    <span className="flex items-center gap-1 text-xs text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                      <Lock size={9} /> Frozen
                    </span>
                  )}
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>

              <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{proj.name}</h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">{proj.category}</p>
              {proj.owner && <p className="text-xs text-slate-400 mt-0.5">Owner: {proj.owner}{proj.cmo ? ` · CMO: ${proj.cmo}` : ''}</p>}
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{proj.description}</p>

              {proj.qtpp && (
                <div className="mt-2 px-3 py-2 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-700 line-clamp-1"><span className="font-semibold">QTPP: </span>{proj.qtpp}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical size={12} /> {projForms.length} version{projForms.length !== 1 ? 's' : ''}
                  </span>
                  <StatusBadge status={proj.status} />
                  {latestForm && <StatusBadge status={latestForm.status} />}
                </div>
                {avgScore > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Avg score</span>
                    <ScoreRing score={parseFloat(avgScore.toFixed(1))} size={40} />
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2">Updated {format(new Date(proj.updatedAt), 'MMM d, yyyy')}</p>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <FlaskConical size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No projects found</p>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Project" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Code</label>
              <input
                value={form.projectCode} onChange={(e) => setForm((f) => ({ ...f, projectCode: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
              <input
                autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Zen Citrus Blend"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select
                value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select
                value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Starting Gate</label>
              <select
                value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as GateStage }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {GATE_STAGES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner</label>
              <input
                value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CMO (optional)</label>
              <input
                value={form.cmo} onChange={(e) => setForm((f) => ({ ...f, cmo: e.target.value }))}
                placeholder="e.g. ECS Brands"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this product…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">QTPP (Target Product Profile)</label>
            <textarea
              value={form.qtpp} onChange={(e) => setForm((f) => ({ ...f, qtpp: e.target.value }))}
              placeholder="Dosage form, serving size, target actives, sensory targets, shelf-life goal…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Actives</label>
              <input
                value={form.targetActives} onChange={(e) => setForm((f) => ({ ...f, targetActives: e.target.value }))}
                placeholder="e.g. Ashwagandha 300mg, Chamomile 200mg"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shelf-Life Target</label>
              <input
                value={form.shelfLifeTarget} onChange={(e) => setForm((f) => ({ ...f, shelfLifeTarget: e.target.value }))}
                placeholder="e.g. 12 months ambient"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Sensory Profile</label>
            <textarea
              value={form.targetProfile} onChange={(e) => setForm((f) => ({ ...f, targetProfile: e.target.value }))}
              placeholder="Describe the target sensory/functional profile…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Create Project</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
