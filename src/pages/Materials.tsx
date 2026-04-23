import { useState, type ReactElement } from 'react'
import { Package, Plus, Search, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Link2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Modal } from '../components/Modal'
import type { CoaStatus } from '../types'

function formatCost(value: number | undefined, currency: string | undefined): string {
  if (value == null) return '—'
  const code = currency ?? 'USD'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value)
  } catch {
    return `${value.toFixed(2)} ${code}`
  }
}

function formatSyncedAt(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toISOString().slice(0, 10)
}

const CATEGORIES = ['Active / Botanical', 'Active / Amino Acid', 'Active / Vitamin', 'Flavor', 'Sweetener', 'Acidulant', 'Preservative', 'Base', 'Excipient', 'Packaging', 'Other']

function nextMaterialCode(existing: string[]) {
  const nums = existing.map((c) => parseInt(c.replace('MAT-', ''))).filter(Boolean)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `MAT-${String(next).padStart(4, '0')}`
}

const COA_ICONS: Record<CoaStatus, ReactElement> = {
  pending:  <Clock size={14} className="text-slate-400" />,
  received: <AlertCircle size={14} className="text-amber-500" />,
  approved: <CheckCircle size={14} className="text-green-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
}

export function Materials() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [coaFilter, setCoaFilter] = useState<CoaStatus | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '', supplier: '', category: CATEGORIES[0],
    coaStatus: 'pending' as CoaStatus, rdApproved: false, commercialReady: false, notes: '',
  })

  const uniqueCategories = Array.from(new Set(materials.map((m) => m.category).filter((c): c is string => !!c)))

  const q = search.toLowerCase()
  const filtered = materials.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      (m.supplier?.toLowerCase().includes(q) ?? false) ||
      m.materialCode.toLowerCase().includes(q) ||
      (m.purchaseDescription?.toLowerCase().includes(q) ?? false)
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter
    const matchCoa = coaFilter === 'all' || m.coaStatus === coaFilter
    return matchSearch && matchCat && matchCoa
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    addMaterial({
      ...form,
      supplier: form.supplier.trim() || undefined,
      materialCode: nextMaterialCode(materials.map((m) => m.materialCode)),
    })
    setForm({ name: '', supplier: '', category: CATEGORIES[0], coaStatus: 'pending', rdApproved: false, commercialReady: false, notes: '' })
    setShowAdd(false)
  }

  const coaApproved = materials.filter((m) => m.coaStatus === 'approved').length
  const coaPending = materials.filter((m) => m.coaStatus === 'pending' || m.coaStatus === 'received').length
  const commercialReady = materials.filter((m) => m.commercialReady).length

  const syncedCount = materials.filter((m) => m.netsuiteItemId != null).length

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Materials</h1>
          <p className="text-slate-400 mt-1">Ingredient &amp; material master — COA tracking and qualification status</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Material
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Materials', value: materials.length, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Synced from NetSuite', value: syncedCount, icon: Link2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'COA Approved', value: coaApproved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'COA Pending', value: coaPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Commercial Ready', value: commercialReady, icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search materials…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'received', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setCoaFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${coaFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'All COA' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Material</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Std Cost</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Synced</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">COA</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">R&D</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commercial</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-slate-800">{mat.name}</div>
                    {mat.netsuiteItemId != null && (
                      <span title={`NetSuite item #${mat.netsuiteItemId}`} className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        <Link2 size={10} /> NS
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{mat.materialCode}</div>
                  {mat.notes && <div className="text-xs text-slate-400 mt-0.5 italic">{mat.notes}</div>}
                </td>
                <td className="px-4 py-3.5 text-slate-600">{mat.supplier ?? <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3.5 text-right font-mono text-slate-700">{formatCost(mat.standardCost, mat.costCurrency)}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{mat.baseUnit ?? <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3.5 text-slate-400 text-xs">{formatSyncedAt(mat.costSyncedAt)}</td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {COA_ICONS[mat.coaStatus]}
                    <span className="text-xs capitalize text-slate-600">{mat.coaStatus}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  {mat.rdApproved
                    ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                    : <XCircle size={16} className="text-slate-200 mx-auto" />}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {mat.commercialReady
                    ? <CheckCircle size={16} className="text-green-500 mx-auto" />
                    : <XCircle size={16} className="text-slate-200 mx-auto" />}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <select
                      value={mat.coaStatus}
                      onChange={(e) => updateMaterial(mat.id, { coaStatus: e.target.value as CoaStatus })}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="received">Received</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => updateMaterial(mat.id, { rdApproved: !mat.rdApproved })}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${mat.rdApproved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      R&D
                    </button>
                    <button
                      onClick={() => updateMaterial(mat.id, { commercialReady: !mat.commercialReady })}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${mat.commercialReady ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      Comm.
                    </button>
                    <button onClick={() => deleteMaterial(mat.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No materials found</p>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Material" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Material Name</label>
              <input
                autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ashwagandha Extract KSM-66"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
              <input
                value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                placeholder="e.g. BotanicaLabs"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">COA Status</label>
              <select
                value={form.coaStatus} onChange={(e) => setForm((f) => ({ ...f, coaStatus: e.target.value as CoaStatus }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Spec notes, allergen info, qualification notes…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.rdApproved} onChange={(e) => setForm((f) => ({ ...f, rdApproved: e.target.checked }))}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-sm text-slate-700">R&D Approved</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.commercialReady} onChange={(e) => setForm((f) => ({ ...f, commercialReady: e.target.checked }))}
                className="w-4 h-4 accent-violet-500"
              />
              <span className="text-sm text-slate-700">Commercial Ready</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">Add Material</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
