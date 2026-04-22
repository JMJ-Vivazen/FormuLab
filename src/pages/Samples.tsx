import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TestTube2, Search, ChevronRight, Users, CheckCircle, Clock, Plus, Shield, Printer, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { Modal } from '../components/Modal'
import type { SampleStatus, SampleClass, SampleLifecycleStatus, Sample } from '../types'

const LIFECYCLE_STATUSES: SampleLifecycleStatus[] = [
  'requested', 'pending-assignment', 'assigned', 'labeled', 'quarantine',
  'released', 'in-storage', 'in-transit', 'at-recipient', 'at-review-date',
  'extended', 'consumed', 'returned', 'destroyed', 'closed',
]

const SITES = ['ECS', 'STR', 'VZ', 'RI', 'ALF', 'External Lab']
const STORAGE_CONDITIONS = ['Ambient 20–25°C', 'Refrigerated 2–8°C', 'Frozen −20°C', 'Controlled Room Temp', 'Protect from Light']

const CLASS_LABEL: Record<SampleClass, string> = { A: 'Class A', B: 'Class B', C: 'Class C' }
const CLASS_BG: Record<SampleClass, string> = { A: '#f1f5f9', B: '#dbeafe', C: '#ffedd5' }
const CLASS_COLOR: Record<SampleClass, string> = { A: '#475569', B: '#1d4ed8', C: '#c2410c' }

const STATUS_STICKER_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  released:       { bg: '#dcfce7', color: '#166534', label: 'RELEASED FOR TESTING' },
  quarantine:     { bg: '#fef9c3', color: '#854d0e', label: 'QUARANTINE — DO NOT USE' },
  'in-transit':   { bg: '#dbeafe', color: '#1e40af', label: 'IN TRANSIT' },
  'at-recipient': { bg: '#ede9fe', color: '#5b21b6', label: 'AT RECIPIENT' },
  destroyed:      { bg: '#fee2e2', color: '#991b1b', label: 'REJECTED / DESTROYED' },
  consumed:       { bg: '#f1f5f9', color: '#334155', label: 'CONSUMED' },
}

function generateRsln(site: string) {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `RDS-${yy}${mm}${dd}-${site}-IN-${seq}`
}

// ── Avery 5160 label (1" × 2-5/8") ──────────────────────────────────────────
function SampleLabel({ sampleId }: { sampleId: string }) {
  const { samples, formulations, projects } = useStore()
  const sample = samples.find(s => s.id === sampleId)
  const form   = formulations.find(f => f.id === sample?.formulationId)
  const project = projects.find(p => p.id === sample?.projectId)
  if (!sample) return null

  return (
    <div style={{
      width: '2.625in', height: '1in',
      border: '0.5pt solid #000',
      fontFamily: 'Arial, Helvetica, sans-serif',
      padding: '3pt 4pt 0 4pt',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: '1.2pt',
      backgroundColor: '#fff', overflow: 'hidden',
    }}>
      {/* Brand + Class */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: '7pt', letterSpacing: '0.06em', color: '#4338ca' }}>VIVAZEN</span>
        <span style={{
          fontSize: '5.5pt', fontWeight: 700, padding: '0.5pt 3pt', borderRadius: '2pt',
          color: CLASS_COLOR[sample.sampleClass], backgroundColor: CLASS_BG[sample.sampleClass],
        }}>
          {CLASS_LABEL[sample.sampleClass]}
        </span>
      </div>

      {/* Product name + version */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontWeight: 700, fontSize: '8.5pt', color: '#0f172a',
          maxWidth: '73%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {project?.name ?? 'Unknown Product'}
        </span>
        <span style={{ fontSize: '6pt', color: '#64748b' }}>{form?.versionLabel ?? ''}</span>
      </div>

      {/* RSLN */}
      {sample.rsln && (
        <div style={{ fontSize: '6pt', fontFamily: 'Courier New, monospace', color: '#312e81', letterSpacing: '-0.01em' }}>
          LOT: {sample.rsln}
        </div>
      )}

      {/* Dates */}
      <div style={{ fontSize: '5.5pt', color: '#374151', display: 'flex', gap: '6pt' }}>
        <span>MFG: {sample.dateProduced}</span>
        {sample.expiryDate ? <span>EXP: {sample.expiryDate}</span> : <span style={{ color: '#9ca3af' }}>EXP: See record</span>}
      </div>

      {/* Storage + Site */}
      <div style={{ fontSize: '5.5pt', color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ maxWidth: '75%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {sample.storageCondition || 'Storage: See record'}
        </span>
        {sample.site && <span style={{ color: '#6b7280' }}>Site: {sample.site}</span>}
      </div>

      {/* NOT FOR RESALE footer */}
      <div style={{
        backgroundColor: '#312e81', color: '#fff', textAlign: 'center',
        fontSize: '5.5pt', fontWeight: 700, letterSpacing: '0.1em',
        padding: '1.5pt 0', marginLeft: '-4pt', marginRight: '-4pt',
        flexShrink: 0, marginTop: 'auto',
      }}>
        NOT FOR RESALE — R&amp;D SAMPLE
      </div>
    </div>
  )
}

// Status sticker: 1" × 1" square
function StatusSticker({ status, rsln }: { status: SampleLifecycleStatus; rsln?: string }) {
  const style = STATUS_STICKER_STYLES[status] ?? { bg: '#f1f5f9', color: '#334155', label: status.toUpperCase() }
  return (
    <div style={{
      width: '1in', height: '1in',
      border: '0.5pt solid #000',
      fontFamily: 'Arial, Helvetica, sans-serif',
      backgroundColor: style.bg, color: style.color,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '4pt', padding: '4pt', boxSizing: 'border-box', textAlign: 'center',
    }}>
      <span style={{ fontWeight: 900, fontSize: '7.5pt', letterSpacing: '0.04em', lineHeight: 1.2 }}>
        {style.label}
      </span>
      {rsln && (
        <span style={{ fontSize: '5.5pt', fontFamily: 'Courier New, monospace', color: style.color, opacity: 0.8 }}>
          {rsln}
        </span>
      )}
      <span style={{ fontSize: '5pt', color: style.color, opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em' }}>
        VIVAZEN R&amp;D
      </span>
    </div>
  )
}

// ── Label preview modal ────────────────────────────────────────────────────
function LabelModal({ sample, onClose }: { sample: Sample; onClose: () => void }) {
  const [tab, setTab] = useState<'primary' | 'status'>('primary')

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'avery-label-print-css'
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #avery-label-print-root, #avery-label-print-root * { visibility: visible !important; }
        #avery-label-print-root {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
        }
        @page { size: 2.625in 1in; margin: 0; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById('avery-label-print-css')?.remove() }
  }, [])

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl p-6 shadow-2xl w-[440px]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Print Sample Label</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{sample.rsln || sample.batchCode}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Printer size={14} /> Print
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1.5 mb-5">
            {(['primary', 'status'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'primary' ? 'Primary Label (Avery 5160)' : 'Status Sticker (1" × 1")'}
              </button>
            ))}
          </div>

          {/* Preview at 2.5× */}
          <div className="flex justify-center bg-slate-50 rounded-xl p-4 mb-4" style={{ minHeight: 120 }}>
            <div style={{ transform: 'scale(2.5)', transformOrigin: 'center center', margin: tab === 'primary' ? '12px 72px' : '12px 36px' }}>
              {tab === 'primary'
                ? <SampleLabel sampleId={sample.id} />
                : <StatusSticker status={sample.lifecycleStatus} rsln={sample.rsln} />
              }
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            {tab === 'primary'
              ? 'Avery 5160 · 1" × 2⅝" · Load sheet in printer → set to "Actual Size"'
              : 'Avery 5408 or similar 1" × 1" round/square sticker sheet'
            }
          </p>
        </div>
      </div>

      {/* Hidden print target — overridden to top-left by @media print CSS */}
      <div
        id="avery-label-print-root"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
      >
        {tab === 'primary'
          ? <SampleLabel sampleId={sample.id} />
          : <StatusSticker status={sample.lifecycleStatus} rsln={sample.rsln} />
        }
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export function Samples() {
  const { samples, formulations, projects, addSample, updateSample } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'all'>('all')
  const [classFilter, setClassFilter] = useState<SampleClass | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [labelSample, setLabelSample] = useState<Sample | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '')
  const [newSample, setNewSample] = useState({
    batchCode: '',
    sampleClass: 'A' as SampleClass,
    lifecycleStatus: 'requested' as SampleLifecycleStatus,
    dateProduced: new Date().toISOString().split('T')[0],
    quantity: 1,
    quantityUnit: 'bottles',
    intendedUse: '',
    storageCondition: STORAGE_CONDITIONS[0],
    site: SITES[0],
    externalDistribution: false,
    ingestionPossible: false,
    notes: '',
    expiryDate: '',
    status: 'produced' as SampleStatus,
  })

  const filtered = samples
    .filter((s) => {
      const form = formulations.find((f) => f.id === s.formulationId)
      const proj = projects.find((p) => p.id === s.projectId)
      const matchSearch =
        s.batchCode.toLowerCase().includes(search.toLowerCase()) ||
        (s.rsln ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (form?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (proj?.name ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchClass = classFilter === 'all' || s.sampleClass === classFilter
      return matchSearch && matchStatus && matchClass
    })
    .sort((a, b) => new Date(b.dateProduced).getTime() - new Date(a.dateProduced).getTime())

  const formsForProject = formulations.filter((f) => f.projectId === selectedProjectId)
  const [selectedFormId, setSelectedFormId] = useState(formsForProject[0]?.id ?? '')

  const handleAdd = () => {
    if (!newSample.batchCode.trim() || !selectedFormId) return
    addSample({
      ...newSample,
      formulationId: selectedFormId,
      projectId: selectedProjectId,
      recipients: [],
      rsln: generateRsln(newSample.site),
    })
    setShowAdd(false)
  }

  const classColor: Record<SampleClass, string> = {
    A: 'text-slate-500',
    B: 'text-blue-600',
    C: 'text-orange-600',
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Samples</h1>
          <p className="text-slate-400 mt-1">{samples.length} total sample lots (QP-245)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={15} /> Log Sample
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search batches, RSLN…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'A', 'B', 'C'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setClassFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${classFilter === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {c === 'all' ? 'All Classes' : `Class ${c}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'produced', 'distributed', 'in-review', 'feedback-complete'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((sample) => {
          const form = formulations.find((f) => f.id === sample.formulationId)
          const project = projects.find((p) => p.id === sample.projectId)
          const feedbackDone = sample.recipients.filter((r) => r.feedbackReceived).length

          return (
            <div key={sample.id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    sample.sampleClass === 'C' ? 'bg-orange-50' :
                    sample.sampleClass === 'B' ? 'bg-blue-50' : 'bg-slate-50'
                  }`}>
                    <TestTube2 size={20} className={classColor[sample.sampleClass]} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-800 font-mono">{sample.batchCode}</span>
                      <StatusBadge status={sample.sampleClass} />
                      <StatusBadge status={sample.lifecycleStatus} />
                    </div>
                    {sample.rsln && (
                      <p className="text-xs font-mono text-indigo-600 mt-0.5 flex items-center gap-1">
                        <Shield size={10} /> {sample.rsln}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5">
                      <Link to={`/projects/${project?.id}`} className="hover:text-indigo-600 transition-colors">{project?.name}</Link>
                      {' · '}
                      <Link to={`/formulations/${form?.id}`} className="hover:text-indigo-600 transition-colors">{form?.versionLabel} {form?.name}</Link>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {sample.quantity} {sample.quantityUnit} · Produced {sample.dateProduced}
                      {sample.site && ` · Site: ${sample.site}`}
                      {sample.storageCondition && ` · ${sample.storageCondition}`}
                      {sample.expiryDate && ` · Expires ${sample.expiryDate}`}
                    </p>
                    {sample.intendedUse && (
                      <p className="text-xs text-slate-500 mt-0.5">Use: {sample.intendedUse}</p>
                    )}
                    {sample.ingestionPossible && (
                      <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full mt-1 inline-block">Ingestion possible</span>
                    )}
                    {sample.externalDistribution && (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1 ml-1 inline-block">External distribution</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {sample.recipients.length > 0 && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={12} /> {sample.recipients.length}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <CheckCircle size={12} /> {feedbackDone}/{sample.recipients.length}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <select
                      value={sample.lifecycleStatus}
                      onChange={(e) => updateSample(sample.id, { lifecycleStatus: e.target.value as SampleLifecycleStatus })}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                      {LIFECYCLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setLabelSample(sample)}
                        title="Print label"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors"
                      >
                        <Printer size={12} /> Label
                      </button>
                      <Link
                        to={`/formulations/${sample.formulationId}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {sample.recipients.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                  {sample.recipients.map((r) => (
                    <span key={r.id} className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${r.feedbackReceived ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {r.feedbackReceived ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {r.name} · {r.role}
                    </span>
                  ))}
                </div>
              )}

              {sample.notes && <p className="text-sm text-slate-500 mt-2 italic">{sample.notes}</p>}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <TestTube2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No samples found</p>
            <p className="text-sm mt-1">Log samples from a formulation detail page or using the button above</p>
          </div>
        )}
      </div>

      {/* Label print modal */}
      {labelSample && <LabelModal sample={labelSample} onClose={() => setLabelSample(null)} />}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log New Sample (QP-245)" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
              <select
                value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedFormId('') }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Formula Version</label>
              <select
                value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {formulations.filter((f) => f.projectId === selectedProjectId).map((f) => (
                  <option key={f.id} value={f.id}>{f.versionLabel} — {f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch Code</label>
              <input
                autoFocus value={newSample.batchCode} onChange={(e) => setNewSample((s) => ({ ...s, batchCode: e.target.value }))}
                placeholder="e.g. TTP-003"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sample Class</label>
              <select
                value={newSample.sampleClass} onChange={(e) => setNewSample((s) => ({ ...s, sampleClass: e.target.value as SampleClass }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="A">Class A — Internal / Non-ingestion</option>
                <option value="B">Class B — Internal Ingestion</option>
                <option value="C">Class C — External / Consumer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Site</label>
              <select
                value={newSample.site} onChange={(e) => setNewSample((s) => ({ ...s, site: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {SITES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Produced</label>
              <input
                type="date" value={newSample.dateProduced} onChange={(e) => setNewSample((s) => ({ ...s, dateProduced: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Storage Condition</label>
              <select
                value={newSample.storageCondition} onChange={(e) => setNewSample((s) => ({ ...s, storageCondition: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {STORAGE_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry / Review Date</label>
              <input
                type="date" value={newSample.expiryDate} onChange={(e) => setNewSample((s) => ({ ...s, expiryDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Intended Use</label>
            <input
              value={newSample.intendedUse} onChange={(e) => setNewSample((s) => ({ ...s, intendedUse: e.target.value }))}
              placeholder="e.g. Internal sensory panel, consumer panel, external lab testing…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={newSample.notes} onChange={(e) => setNewSample((s) => ({ ...s, notes: e.target.value }))}
              rows={2} placeholder="Any notes about this batch…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={newSample.ingestionPossible}
                onChange={(e) => setNewSample((s) => ({ ...s, ingestionPossible: e.target.checked }))}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-slate-700">Ingestion possible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={newSample.externalDistribution}
                onChange={(e) => setNewSample((s) => ({ ...s, externalDistribution: e.target.checked }))}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-slate-700">External distribution</span>
            </label>
          </div>
          {newSample.ingestionPossible && newSample.sampleClass !== 'C' && (
            <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
              Ingestion-possible samples should typically be classified as Class C per QP-245.
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Log Sample</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
