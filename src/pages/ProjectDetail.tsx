import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, ArrowLeft, GitBranch, TestTube2, MessageSquare, Trash2, Edit3, Check, Lock, GitMerge } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreRing } from '../components/ScoreRing'
import { Modal } from '../components/Modal'
import { IngredientTable } from '../components/IngredientTable'
import type { FormulationStatus, GateStage, GateDecision, Ingredient } from '../types'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

const STATUS_OPTIONS: FormulationStatus[] = ['draft', 'in-testing', 'approved', 'rejected', 'archived']
const GATE_STAGES: GateStage[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6']
const GATE_DESCRIPTIONS: Record<GateStage, string> = {
  G0: 'Idea Intake & Triage',
  G1: 'Feasibility & Claims Guardrails',
  G2: 'Design Inputs & Development Plan',
  G3: 'Prototype Development & Downselect',
  G4: 'Verification & Formulation Freeze',
  G5: 'Tech Transfer & Pilot / Scale-Up',
  G6: 'Launch Readiness & QMS Handoff',
  archived: 'Archived',
}

interface NewFormState {
  name: string
  versionLabel: string
  processNotes: string
  targetProfile: string
  changeLog: string
  createdBy: string
  status: FormulationStatus
  frozen: boolean
  labelImpact?: string
  ingredients: Ingredient[]
  parentId?: string
}

interface NewGateState {
  gate: GateStage
  plannedDate: string
  actualDate: string
  reviewers: string
  decision: GateDecision
  conditions: string
  conditionOwner: string
  conditionDueDate: string
  evidenceNotes: string
  createdBy: string
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    projects, formulations, samples, feedback, gateReviews,
    deleteProject, updateProject, addFormulation, updateFormulation, deleteFormulation,
    addGateReview, deleteGateReview,
  } = useStore()

  const project = projects.find((p) => p.id === id)
  const projForms = formulations
    .filter((f) => f.projectId === id)
    .sort((a, b) => a.versionNumber - b.versionNumber)
  const projGates = gateReviews
    .filter((g) => g.projectId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const [activeTab, setActiveTab] = useState<'formulations' | 'gates' | 'qtpp'>('formulations')
  const [showNewForm, setShowNewForm] = useState(false)
  const [showNewGate, setShowNewGate] = useState(false)
  const [cloneFromId, setCloneFromId] = useState<string | undefined>()
  const [newForm, setNewForm] = useState<NewFormState>({
    name: '', versionLabel: '', processNotes: '', targetProfile: '',
    changeLog: '', createdBy: 'Jonathan', status: 'draft', frozen: false, ingredients: [],
  })
  const [newGate, setNewGate] = useState<NewGateState>({
    gate: 'G0', plannedDate: '', actualDate: new Date().toISOString().split('T')[0],
    reviewers: 'Jonathan', decision: 'GO', conditions: '',
    conditionOwner: '', conditionDueDate: '', evidenceNotes: '', createdBy: 'Jonathan',
  })
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [editingStage, setEditingStage] = useState(false)

  if (!project) return (
    <div className="p-8">
      <p className="text-slate-500">Project not found.</p>
      <Link to="/projects" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">← Back to Projects</Link>
    </div>
  )

  const openNewForm = (parentId?: string) => {
    const parent = parentId ? formulations.find((f) => f.id === parentId) : undefined
    const nextVer = projForms.length + 1
    const isFreezeStage = project.stage === 'G4' || project.formulaFrozen
    setCloneFromId(parentId)
    setNewForm({
      name: parent ? `${parent.name} (Revision)` : '',
      versionLabel: isFreezeStage ? 'v1.0' : `v0.${nextVer}`,
      processNotes: parent?.processNotes ?? '',
      targetProfile: parent?.targetProfile ?? project.targetProfile,
      changeLog: '',
      createdBy: 'Jonathan',
      status: 'draft',
      frozen: false,
      ingredients: parent ? parent.ingredients.map((i) => ({ ...i, id: uuidv4() })) : [],
      parentId,
    })
    setShowNewForm(true)
  }

  const handleCreate = () => {
    if (!newForm.name.trim()) return
    const nextVer = Math.max(0, ...projForms.map((f) => f.versionNumber)) + 1
    addFormulation({
      ...newForm,
      projectId: id!,
      versionNumber: nextVer,
      parentId: cloneFromId,
    })
    setShowNewForm(false)
  }

  const handleDeleteProject = () => {
    if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      deleteProject(id!)
      navigate('/projects')
    }
  }

  const handleAddGate = () => {
    if (!newGate.decision) return
    addGateReview({ ...newGate, projectId: id! })
    if (newGate.decision === 'GO' || newGate.decision === 'GO with Conditions') {
      const currentIdx = GATE_STAGES.indexOf(newGate.gate)
      const nextStage = GATE_STAGES[currentIdx + 1] ?? newGate.gate
      updateProject(id!, {
        stage: nextStage,
        formulaFrozen: newGate.gate === 'G4' && newGate.decision === 'GO' ? true : project.formulaFrozen,
      })
    }
    setShowNewGate(false)
    setActiveTab('gates')
  }

  const decisionColor: Record<GateDecision, string> = {
    'GO': 'border-green-300 bg-green-50',
    'GO with Conditions': 'border-amber-300 bg-amber-50',
    'HOLD': 'border-red-300 bg-red-50',
    'RECYCLE': 'border-orange-300 bg-orange-50',
    pending: 'border-slate-200 bg-slate-50',
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} /> Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{project.projectCode}</span>
              <StatusBadge status={project.priority} />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
              <StatusBadge status={project.status} size="md" />
              {project.formulaFrozen && (
                <span className="flex items-center gap-1.5 text-sm text-violet-700 bg-violet-50 px-3 py-1 rounded-full font-medium">
                  <Lock size={13} /> Formula Frozen
                </span>
              )}
            </div>
            <p className="text-sm text-indigo-600 font-medium mt-1">{project.category}</p>
            <p className="text-slate-500 text-sm mt-1.5 max-w-2xl">{project.description}</p>
            {project.owner && (
              <p className="text-xs text-slate-400 mt-1">Owner: {project.owner}{project.cmo ? ` · CMO: ${project.cmo}` : ''}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { setNewGate((g) => ({ ...g, gate: project.stage })); setShowNewGate(true) }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
            >
              <GitMerge size={15} /> Record Gate
            </button>
            <button
              onClick={() => openNewForm()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> New Version
            </button>
            <button onClick={handleDeleteProject} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stage-Gate Stepper */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 text-sm">Stage-Gate Progress</h2>
          {editingStage ? (
            <div className="flex items-center gap-2">
              <select
                value={project.stage}
                onChange={(e) => { updateProject(id!, { stage: e.target.value as GateStage }); setEditingStage(false) }}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {GATE_STAGES.map((g) => <option key={g} value={g}>{g} — {GATE_DESCRIPTIONS[g]}</option>)}
              </select>
              <button onClick={() => setEditingStage(false)} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingStage(true)} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              <Edit3 size={11} /> Override stage
            </button>
          )}
        </div>
        <div className="flex items-center gap-0">
          {GATE_STAGES.map((stage, idx) => {
            const stageIdx = GATE_STAGES.indexOf(project.stage)
            const isPast = idx < stageIdx
            const isCurrent = idx === stageIdx
            const gateDecision = projGates.filter((g) => g.gate === stage).slice(-1)[0]

            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' :
                    isPast ? 'bg-green-500 border-green-500 text-white' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isPast ? <Check size={14} /> : stage}
                  </div>
                  <div className="mt-1.5 text-center">
                    <div className={`text-xs font-semibold ${isCurrent ? 'text-indigo-700' : isPast ? 'text-green-600' : 'text-slate-400'}`}>
                      {stage}
                    </div>
                    {gateDecision && (
                      <div className="mt-0.5">
                        <StatusBadge status={gateDecision.decision} />
                      </div>
                    )}
                  </div>
                </div>
                {idx < GATE_STAGES.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded ${isPast ? 'bg-green-400' : isCurrent ? 'bg-indigo-200' : 'bg-slate-100'}`} />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center font-medium">
          Current: <span className="text-indigo-700">{project.stage} — {GATE_DESCRIPTIONS[project.stage]}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-100">
        {([
          { key: 'formulations', label: `Formulations (${projForms.length})` },
          { key: 'gates', label: `Gate Reviews (${projGates.length})` },
          { key: 'qtpp', label: 'QTPP & Details' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Formulations Tab */}
      {activeTab === 'formulations' && (
        <>
          {project.targetProfile && (
            <div className="mb-4 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Target Sensory Profile</span>
              <p className="text-sm text-indigo-800 mt-1">{project.targetProfile}</p>
            </div>
          )}

          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Formulation Timeline</h2>
            <span className="text-sm text-slate-400">{projForms.length} version{projForms.length !== 1 ? 's' : ''}</span>
          </div>

          {projForms.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-14 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Plus size={22} className="text-indigo-400" />
              </div>
              <p className="font-medium text-slate-500">No formulations yet</p>
              <p className="text-sm text-slate-400 mt-1">Create the first version to start iterating</p>
              <button
                onClick={() => openNewForm()}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Create First Version
              </button>
            </div>
          )}

          <div className="space-y-3">
            {projForms.map((form, idx) => {
              const formSamples = samples.filter((s) => s.formulationId === form.id)
              const formFeedback = feedback.filter((f) => f.formulationId === form.id)
              const avgScore = formFeedback.length
                ? formFeedback.reduce((s, f) => s + f.overallScore, 0) / formFeedback.length : 0
              const isLatest = idx === projForms.length - 1

              return (
                <div key={form.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isLatest ? 'border-indigo-200' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      form.frozen ? 'bg-violet-600 text-white' :
                      isLatest ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {form.frozen ? <Lock size={16} /> : null}
                      <span className="text-xs font-bold leading-none">{form.versionLabel}</span>
                      {isLatest && !form.frozen && <span className="text-xs opacity-70 mt-0.5">Latest</span>}
                      {form.frozen && <span className="text-xs opacity-70 mt-0.5">Frozen</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-slate-800">{form.name}</span>
                        {editingStatus === form.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={form.status}
                              onChange={(e) => updateFormulation(form.id, { status: e.target.value as FormulationStatus })}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => setEditingStatus(null)} className="text-green-500 hover:text-green-700"><Check size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingStatus(form.id)} className="group flex items-center gap-1">
                            <StatusBadge status={form.status} />
                            <Edit3 size={11} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                        {form.frozen && <StatusBadge status={'approved'} />}
                        {form.parentId && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <GitBranch size={11} /> based on {projForms.find((f) => f.id === form.parentId)?.versionLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{format(new Date(form.createdAt), 'MMM d, yyyy')} · by {form.createdBy}</p>
                      {form.changeLog && (
                        <p className="text-sm text-slate-600 mt-1.5 italic">"{form.changeLog}"</p>
                      )}
                      {form.labelImpact && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-1.5 inline-block">Label impact: {form.labelImpact}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <TestTube2 size={12} /> {formSamples.length} sample{formSamples.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MessageSquare size={12} /> {formFeedback.length} feedback
                        </div>
                      </div>
                      {avgScore > 0 && <ScoreRing score={parseFloat(avgScore.toFixed(1))} size={48} />}

                      <div className="flex flex-col gap-1.5">
                        <Link
                          to={`/formulations/${form.id}`}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          View <ChevronRight size={12} />
                        </Link>
                        {!form.frozen && (
                          <button
                            onClick={() => openNewForm(form.id)}
                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors flex items-center gap-1"
                          >
                            <GitBranch size={11} /> Revise
                          </button>
                        )}
                        {!form.frozen && project.stage === 'G4' && (
                          <button
                            onClick={() => updateFormulation(form.id, { frozen: true, status: 'approved' })}
                            className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors flex items-center gap-1"
                          >
                            <Lock size={11} /> Freeze
                          </button>
                        )}
                      </div>

                      <button onClick={() => deleteFormulation(form.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Gate Reviews Tab */}
      {activeTab === 'gates' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setNewGate((g) => ({ ...g, gate: project.stage })); setShowNewGate(true) }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Record Gate Decision
            </button>
          </div>

          {projGates.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <GitMerge size={28} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No gate reviews recorded</p>
              <p className="text-sm mt-1">Record the first gate decision to begin tracking QMS compliance</p>
            </div>
          )}

          <div className="space-y-3">
            {projGates.map((gate) => (
              <div key={gate.id} className={`bg-white border-2 rounded-2xl p-5 shadow-sm ${decisionColor[gate.decision]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-800 text-lg">{gate.gate}</span>
                      <StatusBadge status={gate.decision} size="md" />
                      <span className="text-sm text-slate-500">{GATE_DESCRIPTIONS[gate.gate]}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {gate.actualDate && `Reviewed ${format(new Date(gate.actualDate), 'MMM d, yyyy')}`}
                      {gate.plannedDate && gate.actualDate !== gate.plannedDate && ` (planned ${format(new Date(gate.plannedDate), 'MMM d, yyyy')})`}
                      {gate.reviewers && ` · ${gate.reviewers}`}
                      {` · Recorded by ${gate.createdBy}`}
                    </p>
                    {gate.evidenceNotes && (
                      <p className="text-sm text-slate-700 mt-2">{gate.evidenceNotes}</p>
                    )}
                    {gate.conditions && (
                      <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Condition</span>
                        <p className="text-sm text-amber-900 mt-0.5">{gate.conditions}</p>
                        {gate.conditionOwner && (
                          <p className="text-xs text-amber-600 mt-1">
                            Owner: {gate.conditionOwner}
                            {gate.conditionDueDate && ` · Due ${format(new Date(gate.conditionDueDate), 'MMM d, yyyy')}`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteGateReview(gate.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1 ml-3">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QTPP & Details Tab */}
      {activeTab === 'qtpp' && (
        <div className="space-y-4">
          {project.qtpp && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">QTPP — Target Product Profile</h3>
              <p className="text-sm text-slate-700">{project.qtpp}</p>
            </div>
          )}
          {project.targetActives && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Actives</h3>
              <p className="text-sm text-slate-700">{project.targetActives}</p>
            </div>
          )}
          {project.shelfLifeTarget && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shelf-Life Target</h3>
              <p className="text-sm text-slate-700">{project.shelfLifeTarget}</p>
            </div>
          )}
          {project.targetProfile && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Sensory Profile</h3>
              <p className="text-sm text-slate-700">{project.targetProfile}</p>
            </div>
          )}
          {!project.qtpp && !project.targetActives && !project.shelfLifeTarget && (
            <p className="text-slate-400 text-sm">No QTPP details recorded for this project.</p>
          )}
        </div>
      )}

      {/* New Formulation Modal */}
      <Modal open={showNewForm} onClose={() => setShowNewForm(false)} title={cloneFromId ? 'Revise Formulation' : 'New Formulation'} size="xl">
        <div className="space-y-5">
          {project.formulaFrozen && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              Formula is frozen at G4. Post-freeze changes should go through formal change control. Document rationale carefully.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Version Label</label>
              <input
                value={newForm.versionLabel} onChange={(e) => setNewForm((f) => ({ ...f, versionLabel: e.target.value }))}
                placeholder="e.g. v0.3"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Formulation Name</label>
              <input
                autoFocus value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Reduced Sugar + Honey"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">What Changed</label>
            <textarea
              value={newForm.changeLog} onChange={(e) => setNewForm((f) => ({ ...f, changeLog: e.target.value }))}
              placeholder="Describe what was changed from the previous version and why…"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Label Impact</label>
            <input
              value={newForm.labelImpact ?? ''} onChange={(e) => setNewForm((f) => ({ ...f, labelImpact: e.target.value }))}
              placeholder="Any label changes triggered by this version? (optional)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ingredients</label>
            <IngredientTable
              ingredients={newForm.ingredients}
              onChange={(ingredients) => setNewForm((f) => ({ ...f, ingredients }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Process Notes</label>
              <textarea
                value={newForm.processNotes} onChange={(e) => setNewForm((f) => ({ ...f, processNotes: e.target.value }))}
                placeholder="Manufacturing / mixing notes…"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Profile</label>
              <textarea
                value={newForm.targetProfile} onChange={(e) => setNewForm((f) => ({ ...f, targetProfile: e.target.value }))}
                placeholder="Sensory / functional target for this version…"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Created By</label>
              <input
                value={newForm.createdBy} onChange={(e) => setNewForm((f) => ({ ...f, createdBy: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={newForm.status} onChange={(e) => setNewForm((f) => ({ ...f, status: e.target.value as FormulationStatus }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleCreate} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">
              {cloneFromId ? 'Create Revision' : 'Create Formulation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Gate Review Modal */}
      <Modal open={showNewGate} onClose={() => setShowNewGate(false)} title="Record Gate Decision" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gate</label>
              <select
                value={newGate.gate} onChange={(e) => setNewGate((g) => ({ ...g, gate: e.target.value as GateStage }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {GATE_STAGES.map((g) => <option key={g} value={g}>{g} — {GATE_DESCRIPTIONS[g]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Decision</label>
              <select
                value={newGate.decision} onChange={(e) => setNewGate((g) => ({ ...g, decision: e.target.value as GateDecision }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {(['GO', 'GO with Conditions', 'HOLD', 'RECYCLE'] as GateDecision[]).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Actual Review Date</label>
              <input
                type="date" value={newGate.actualDate} onChange={(e) => setNewGate((g) => ({ ...g, actualDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Planned Date (optional)</label>
              <input
                type="date" value={newGate.plannedDate} onChange={(e) => setNewGate((g) => ({ ...g, plannedDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reviewers</label>
            <input
              value={newGate.reviewers} onChange={(e) => setNewGate((g) => ({ ...g, reviewers: e.target.value }))}
              placeholder="e.g. Jonathan, QA Lead, RA"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Evidence Notes</label>
            <textarea
              value={newGate.evidenceNotes} onChange={(e) => setNewGate((g) => ({ ...g, evidenceNotes: e.target.value }))}
              placeholder="What evidence was reviewed? Key findings, checklist items met…"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          {newGate.decision === 'GO with Conditions' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-amber-700">Condition Details</h4>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Condition Description</label>
                <textarea
                  value={newGate.conditions} onChange={(e) => setNewGate((g) => ({ ...g, conditions: e.target.value }))}
                  placeholder="Describe the condition that must be met…"
                  rows={2}
                  className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Condition Owner</label>
                  <input
                    value={newGate.conditionOwner} onChange={(e) => setNewGate((g) => ({ ...g, conditionOwner: e.target.value }))}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date" value={newGate.conditionDueDate} onChange={(e) => setNewGate((g) => ({ ...g, conditionDueDate: e.target.value }))}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
          {newGate.gate === 'G4' && newGate.decision === 'GO' && (
            <div className="px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl text-sm text-violet-800">
              <strong>G4 GO</strong> will lock the formulation: formula V1.0 will be frozen and post-freeze changes will require formal change control.
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowNewGate(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAddGate} className="px-5 py-2 text-sm bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium">Record Decision</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
