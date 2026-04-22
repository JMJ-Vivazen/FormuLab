import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, TestTube2, MessageSquare, GitBranch, Beaker, Lock, Copy, GitCompare, Pencil, Check, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreRing } from '../components/ScoreRing'
import { Modal } from '../components/Modal'
import { IngredientTable } from '../components/IngredientTable'
import { FeedbackRadar } from '../components/FeedbackRadar'
import { FormulationCompareModal } from '../components/FormulationCompareModal'
import { createFormulation, updateFormulation } from '../lib/api/formulations'
import { format } from 'date-fns'
import type { Ingredient, SampleClass, SampleLifecycleStatus, FormulationStatus } from '../types'

export function FormulationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { formulations, projects, samples, feedback, addSample, addFeedback } = useStore()

  const form = formulations.find((f) => f.id === id)
  const project = form ? projects.find((p) => p.id === form.projectId) : null
  const formSamples = samples.filter((s) => s.formulationId === id)
  const formFeedback = feedback.filter((f) => f.formulationId === id)
  const avgScore = formFeedback.length
    ? formFeedback.reduce((s, f) => s + f.overallScore, 0) / formFeedback.length : 0
  const projectFormulations = form ? formulations.filter((f) => f.projectId === form.projectId) : []

  const [tab, setTab] = useState<'ingredients' | 'samples' | 'feedback'>('ingredients')
  const [showNewSample, setShowNewSample] = useState(false)
  const [showNewFeedback, setShowNewFeedback] = useState(false)
  const [showFork, setShowFork] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [forking, setForking] = useState(false)
  const [forkForm, setForkForm] = useState({ versionLabel: '', changeLog: '' })
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<{
    name: string
    status: FormulationStatus
    ingredients: Ingredient[]
    processNotes: string
    targetProfile: string
    changeLog: string
    labelImpact: string
    riskNotes: string
  }>({
    name: '',
    status: 'draft',
    ingredients: [],
    processNotes: '',
    targetProfile: '',
    changeLog: '',
    labelImpact: '',
    riskNotes: '',
  })

  useEffect(() => {
    setIsEditing(false)
  }, [id])

  const [newSample, setNewSample] = useState({
    batchCode: '', dateProduced: '', quantity: 1, quantityUnit: 'bottles', notes: '', expiryDate: '',
    sampleClass: 'A' as SampleClass,
    lifecycleStatus: 'requested' as SampleLifecycleStatus,
    externalDistribution: false, ingestionPossible: false,
    site: 'ECS', storageCondition: 'Ambient 20–25°C', intendedUse: '',
  })

  const [newFeedback, setNewFeedback] = useState({
    reviewerName: '', reviewerRole: 'Internal Tester',
    ratings: { taste: 7, aroma: 7, appearance: 7, texture: 7, aftertaste: 7, overall: 7 } as Record<string, number>,
    overallScore: 7,
    positives: '', negatives: '', suggestions: '',
    recommendReformulation: false,
  })

  if (!form || !project) return (
    <div className="p-8">
      <p className="text-slate-500">Formulation not found.</p>
    </div>
  )

  const handleAddSample = () => {
    if (!newSample.batchCode.trim()) return
    addSample({
      formulationId: id!, projectId: form.projectId,
      ...newSample, recipients: [], status: 'produced',
    })
    setNewSample({
      batchCode: '', dateProduced: '', quantity: 1, quantityUnit: 'bottles', notes: '', expiryDate: '',
      sampleClass: 'A' as import('../types').SampleClass,
      lifecycleStatus: 'requested' as import('../types').SampleLifecycleStatus,
      externalDistribution: false, ingestionPossible: false,
      site: 'ECS', storageCondition: 'Ambient 20–25°C', intendedUse: '',
    })
    setShowNewSample(false)
  }

  const startEdit = () => {
    if (!form || form.frozen) return
    setDraft({
      name: form.name,
      status: form.status,
      ingredients: form.ingredients.map((i) => ({ ...i })),
      processNotes: form.processNotes,
      targetProfile: form.targetProfile,
      changeLog: form.changeLog,
      labelImpact: form.labelImpact ?? '',
      riskNotes: form.riskNotes ?? '',
    })
    setIsEditing(true)
  }

  const cancelEdit = () => setIsEditing(false)

  const saveEdit = async () => {
    if (!form || saving) return
    setSaving(true)
    try {
      await updateFormulation(form.id, {
        name: draft.name.trim() || form.name,
        status: draft.status,
        ingredients: draft.ingredients,
        processNotes: draft.processNotes,
        targetProfile: draft.targetProfile,
        changeLog: draft.changeLog,
        labelImpact: draft.labelImpact || undefined,
        riskNotes: draft.riskNotes || undefined,
      })
      await qc.invalidateQueries({ queryKey: ['formulations'] })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const openFork = () => {
    if (!form) return
    const nextNumber = projectFormulations.reduce((m, f) => Math.max(m, f.versionNumber), 0) + 1
    setForkForm({
      versionLabel: `V${nextNumber}.0`,
      changeLog: `Forked from ${form.versionLabel}`,
    })
    setShowFork(true)
  }

  const handleFork = async () => {
    if (!form || !forkForm.versionLabel.trim() || forking) return
    setForking(true)
    try {
      const nextNumber = projectFormulations.reduce((m, f) => Math.max(m, f.versionNumber), 0) + 1
      const created = await createFormulation({
        projectId: form.projectId,
        parentId: form.id,
        versionNumber: nextNumber,
        versionLabel: forkForm.versionLabel.trim(),
        name: form.name,
        ingredients: form.ingredients.map((i) => ({ ...i, id: crypto.randomUUID() })),
        processNotes: form.processNotes,
        targetProfile: form.targetProfile,
        status: 'draft',
        frozen: false,
        changeLog: forkForm.changeLog.trim(),
        labelImpact: form.labelImpact,
        riskNotes: form.riskNotes,
        createdBy: form.createdBy,
      })
      qc.invalidateQueries({ queryKey: ['formulations'] })
      setShowFork(false)
      navigate(`/formulations/${created.id}`)
    } finally {
      setForking(false)
    }
  }

  const handleAddFeedback = () => {
    if (!newFeedback.reviewerName.trim() || !selectedSampleId) return
    addFeedback({
      sampleId: selectedSampleId,
      formulationId: id!, projectId: form.projectId,
      ...newFeedback,
    })
    setNewFeedback({
      reviewerName: '', reviewerRole: 'Internal Tester',
      ratings: { taste: 7, aroma: 7, appearance: 7, texture: 7, aftertaste: 7, overall: 7 } as Record<string, number>,
      overallScore: 7, positives: '', negatives: '', suggestions: '',
      recommendReformulation: false,
    })
    setShowNewFeedback(false)
  }

  const ATTRS = ['taste', 'aroma', 'appearance', 'texture', 'aftertaste', 'overall']

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link to={`/projects/${project.id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} /> {project.name}
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${form.frozen ? 'bg-violet-600' : 'bg-indigo-600'}`}>
                {form.frozen ? <Lock size={16} /> : form.versionLabel}
              </div>
              {isEditing ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-800">{form.name}</h1>
              )}
              {isEditing ? (
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as FormulationStatus }))}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {(['draft', 'in-testing', 'approved', 'rejected', 'archived'] as FormulationStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={form.status} size="md" />
              )}
              {form.frozen && (
                <span className="flex items-center gap-1.5 text-sm text-violet-700 bg-violet-50 px-3 py-1 rounded-full font-medium">
                  <Lock size={12} /> Frozen V1.0
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1.5">
              Created {format(new Date(form.createdAt), 'MMM d, yyyy')} by {form.createdBy}
              {form.parentId && (
                <span className="ml-3 flex items-center gap-1 text-indigo-500 inline-flex">
                  <GitBranch size={12} />
                  Revised from {formulations.find((f) => f.id === form.parentId)?.versionLabel}
                </span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0 flex items-start gap-3">
            {avgScore > 0 && !isEditing && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Avg feedback</span>
                <ScoreRing score={parseFloat(avgScore.toFixed(1))} size={56} />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              {isEditing ? (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={12} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    <X size={12} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startEdit}
                    disabled={form.frozen}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={form.frozen ? 'Frozen formulations cannot be edited — fork a new version instead' : 'Edit this formulation'}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={openFork}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                    title="Create a new version starting from this formulation's ingredients"
                  >
                    <Copy size={12} /> Fork Version
                  </button>
                  <button
                    onClick={() => setShowCompare(true)}
                    disabled={projectFormulations.length < 2}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={projectFormulations.length < 2 ? 'Need at least 2 formulations in project' : 'Compare to another version'}
                  >
                    <GitCompare size={12} /> Compare
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
            <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Change Log</label>
            <textarea
              value={draft.changeLog}
              onChange={(e) => setDraft((d) => ({ ...d, changeLog: e.target.value }))}
              rows={2}
              placeholder="What changed in this version…"
              className="mt-1 w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>
        ) : (
          form.changeLog && (
            <div className="mt-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Change Log</span>
              <p className="text-sm text-amber-900 mt-1">{form.changeLog}</p>
            </div>
          )
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-100">
        {([
          { key: 'ingredients', label: 'Ingredients', icon: Beaker, count: form.ingredients.length },
          { key: 'samples', label: 'Samples', icon: TestTube2, count: formSamples.length },
          { key: 'feedback', label: 'Feedback', icon: MessageSquare, count: formFeedback.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Ingredients Tab */}
      {tab === 'ingredients' && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Process Notes</h3>
              {isEditing ? (
                <textarea
                  value={draft.processNotes}
                  onChange={(e) => setDraft((d) => ({ ...d, processNotes: e.target.value }))}
                  rows={4}
                  placeholder="Mixing order, temperatures, homogenization details…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{form.processNotes || <span className="text-slate-300">None recorded</span>}</p>
              )}
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Profile</h3>
              {isEditing ? (
                <textarea
                  value={draft.targetProfile}
                  onChange={(e) => setDraft((d) => ({ ...d, targetProfile: e.target.value }))}
                  rows={4}
                  placeholder="Sensory targets, pH, brix, viscosity…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{form.targetProfile || <span className="text-slate-300">None recorded</span>}</p>
              )}
            </div>
          </div>
          {isEditing ? (
            <IngredientTable
              ingredients={draft.ingredients}
              onChange={(ings) => setDraft((d) => ({ ...d, ingredients: ings }))}
            />
          ) : (
            <IngredientTable ingredients={form.ingredients} onChange={() => {}} readOnly />
          )}
        </div>
      )}

      {/* Samples Tab */}
      {tab === 'samples' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowNewSample(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Log Sample
            </button>
          </div>

          {formSamples.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <TestTube2 size={28} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No samples logged yet</p>
            </div>
          )}

          <div className="space-y-3">
            {formSamples.map((sample) => (
              <div key={sample.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-800 font-mono">{sample.batchCode}</span>
                      <StatusBadge status={sample.status} />
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {sample.quantity} {sample.quantityUnit} · Produced {sample.dateProduced}
                      {sample.expiryDate && ` · Expires ${sample.expiryDate}`}
                    </p>
                    {sample.notes && <p className="text-sm text-slate-600 mt-1.5">{sample.notes}</p>}
                  </div>
                  <button
                    onClick={() => { setSelectedSampleId(sample.id); setShowNewFeedback(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <MessageSquare size={12} /> Add Feedback
                  </button>
                </div>

                {sample.recipients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-400 font-medium mb-2">Recipients</p>
                    <div className="flex flex-wrap gap-2">
                      {sample.recipients.map((r) => (
                        <span key={r.id} className={`text-xs px-2.5 py-1 rounded-full ${r.feedbackReceived ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {r.name} · {r.role}
                          {r.feedbackReceived ? ' ✓' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {tab === 'feedback' && (
        <div>
          <div className="flex justify-end mb-4">
            {formSamples.length > 0 && (
              <button
                onClick={() => { setSelectedSampleId(formSamples[0].id); setShowNewFeedback(true) }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={15} /> Add Feedback
              </button>
            )}
          </div>

          {formFeedback.length > 0 && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Sensory Profile</h3>
                <p className="text-xs text-slate-400 mb-3">Average across {formFeedback.length} response{formFeedback.length !== 1 ? 's' : ''}</p>
                <FeedbackRadar feedbackList={formFeedback} />
              </div>
              <div className="space-y-3">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Common Positives</h3>
                  {formFeedback.filter((f) => f.positives).map((f) => (
                    <p key={f.id} className="text-sm text-slate-700 mb-1.5">• {f.positives}</p>
                  ))}
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Issues Flagged</h3>
                  {formFeedback.filter((f) => f.negatives).map((f) => (
                    <p key={f.id} className="text-sm text-slate-700 mb-1.5">• {f.negatives}</p>
                  ))}
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Suggestions</h3>
                  {formFeedback.filter((f) => f.suggestions).map((f) => (
                    <p key={f.id} className="text-sm text-slate-700 mb-1.5">• {f.suggestions}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {formFeedback.map((fb) => (
              <div key={fb.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-slate-800">{fb.reviewerName}</span>
                    <span className="text-sm text-slate-400 ml-2">· {fb.reviewerRole}</span>
                    <span className="text-xs text-slate-300 ml-2">{format(new Date(fb.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {fb.recommendReformulation && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">Needs revision</span>
                    )}
                    <ScoreRing score={fb.overallScore} size={44} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {ATTRS.map((attr) => {
                    const val = fb.ratings[attr]
                    if (val == null) return null
                    const pct = val / 10
                    const color = pct >= 0.7 ? 'bg-green-500' : pct >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
                    return (
                      <div key={attr} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-slate-500 capitalize">{attr}</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{val}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {formFeedback.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare size={28} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feedback yet</p>
                <p className="text-sm mt-1">Log a sample first, then collect feedback</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Sample Modal */}
      <Modal open={showNewSample} onClose={() => setShowNewSample(false)} title="Log New Sample" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch Code</label>
              <input
                autoFocus value={newSample.batchCode} onChange={(e) => setNewSample((s) => ({ ...s, batchCode: e.target.value }))}
                placeholder="e.g. ZCB-003"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Produced</label>
              <input
                type="date" value={newSample.dateProduced} onChange={(e) => setNewSample((s) => ({ ...s, dateProduced: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
              <input
                type="number" value={newSample.quantity} onChange={(e) => setNewSample((s) => ({ ...s, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
              <input
                value={newSample.quantityUnit} onChange={(e) => setNewSample((s) => ({ ...s, quantityUnit: e.target.value }))}
                placeholder="bottles, pouches, cans…"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={newSample.notes} onChange={(e) => setNewSample((s) => ({ ...s, notes: e.target.value }))}
              rows={2} placeholder="Any notes about this batch…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowNewSample(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAddSample} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Log Sample</button>
          </div>
        </div>
      </Modal>

      {/* Add Feedback Modal */}
      <Modal open={showNewFeedback} onClose={() => setShowNewFeedback(false)} title="Record Feedback" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reviewer Name</label>
              <input
                autoFocus value={newFeedback.reviewerName} onChange={(e) => setNewFeedback((f) => ({ ...f, reviewerName: e.target.value }))}
                placeholder="e.g. Sarah K."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={newFeedback.reviewerRole} onChange={(e) => setNewFeedback((f) => ({ ...f, reviewerRole: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {['Internal Tester', 'Consumer Panel', 'Customer', 'Scientist', 'Manager', 'External Reviewer'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {formSamples.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sample</label>
              <select
                value={selectedSampleId ?? ''}
                onChange={(e) => setSelectedSampleId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {formSamples.map((s) => <option key={s.id} value={s.id}>{s.batchCode}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Attribute Scores <span className="text-slate-400 font-normal">(1–10)</span></label>
            <div className="space-y-2">
              {ATTRS.map((attr) => {
                const val = newFeedback.ratings[attr] ?? 7
                return (
                  <div key={attr} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 capitalize w-24">{attr}</span>
                    <input
                      type="range" min={1} max={10} value={val}
                      onChange={(e) => setNewFeedback((f) => ({ ...f, ratings: { ...f.ratings, [attr]: parseInt(e.target.value) } }))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className={`text-sm font-bold w-6 text-center ${val >= 7 ? 'text-green-600' : val >= 5 ? 'text-amber-500' : 'text-red-500'}`}>{val}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">What worked well?</label>
            <textarea
              value={newFeedback.positives} onChange={(e) => setNewFeedback((f) => ({ ...f, positives: e.target.value }))}
              rows={2} placeholder="Positives…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">What didn't work?</label>
            <textarea
              value={newFeedback.negatives} onChange={(e) => setNewFeedback((f) => ({ ...f, negatives: e.target.value }))}
              rows={2} placeholder="Issues or negatives…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Suggestions for next iteration</label>
            <textarea
              value={newFeedback.suggestions} onChange={(e) => setNewFeedback((f) => ({ ...f, suggestions: e.target.value }))}
              rows={2} placeholder="What should change?…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox" checked={newFeedback.recommendReformulation}
              onChange={(e) => setNewFeedback((f) => ({ ...f, recommendReformulation: e.target.checked }))}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-slate-700">Recommend reformulation before moving forward</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowNewFeedback(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAddFeedback} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Submit Feedback</button>
          </div>
        </div>
      </Modal>

      {/* Fork Modal */}
      <Modal open={showFork} onClose={() => setShowFork(false)} title={`Fork from ${form.versionLabel}`} size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Creates a new formulation with {form.ingredients.length} ingredient{form.ingredients.length === 1 ? '' : 's'} copied from this version. The new version will be linked to {form.versionLabel} as its parent.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Version Label</label>
            <input
              autoFocus
              value={forkForm.versionLabel}
              onChange={(e) => setForkForm((f) => ({ ...f, versionLabel: e.target.value }))}
              placeholder="V2.0"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Change Log <span className="text-slate-400 font-normal">(what will be different in this version)</span>
            </label>
            <textarea
              value={forkForm.changeLog}
              onChange={(e) => setForkForm((f) => ({ ...f, changeLog: e.target.value }))}
              rows={3}
              placeholder="Reducing sweetener by 20%, replacing natural flavor with citrus blend…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowFork(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button
              onClick={handleFork}
              disabled={!forkForm.versionLabel.trim() || forking}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {forking ? 'Creating…' : 'Create Fork'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Compare Modal */}
      <FormulationCompareModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        current={form}
        siblings={projectFormulations}
      />
    </div>
  )
}
