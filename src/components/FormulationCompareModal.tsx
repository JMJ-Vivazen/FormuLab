import { useMemo, useState } from 'react'
import { ArrowRight, Minus, Plus, Equal } from 'lucide-react'
import { Modal } from './Modal'
import type { Formulation, Ingredient } from '../types'

type DiffRow =
  | { kind: 'added'; name: string; to: Ingredient }
  | { kind: 'removed'; name: string; from: Ingredient }
  | { kind: 'changed'; name: string; from: Ingredient; to: Ingredient }
  | { kind: 'unchanged'; name: string; ing: Ingredient }

const normKey = (s: string) => s.trim().toLowerCase()

function diffIngredients(from: Ingredient[], to: Ingredient[]): DiffRow[] {
  const fromMap = new Map(from.map(i => [normKey(i.name), i]))
  const toMap = new Map(to.map(i => [normKey(i.name), i]))
  const rows: DiffRow[] = []

  for (const [k, toIng] of toMap) {
    const fromIng = fromMap.get(k)
    if (!fromIng) {
      rows.push({ kind: 'added', name: toIng.name, to: toIng })
    } else if (
      fromIng.amount !== toIng.amount ||
      fromIng.unit !== toIng.unit ||
      (fromIng.supplier ?? '') !== (toIng.supplier ?? '') ||
      (fromIng.percentage ?? null) !== (toIng.percentage ?? null)
    ) {
      rows.push({ kind: 'changed', name: toIng.name, from: fromIng, to: toIng })
    } else {
      rows.push({ kind: 'unchanged', name: toIng.name, ing: toIng })
    }
  }
  for (const [k, fromIng] of fromMap) {
    if (!toMap.has(k)) rows.push({ kind: 'removed', name: fromIng.name, from: fromIng })
  }
  const order = { added: 0, removed: 1, changed: 2, unchanged: 3 } as const
  return rows.sort((a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name))
}

function ingredientSummary(i: Ingredient): string {
  const parts: string[] = []
  parts.push(`${i.amount} ${i.unit}`)
  if (i.percentage != null) parts.push(`${i.percentage}%`)
  if (i.supplier) parts.push(i.supplier)
  return parts.join(' · ')
}

interface Props {
  open: boolean
  onClose: () => void
  current: Formulation
  siblings: Formulation[]
}

export function FormulationCompareModal({ open, onClose, current, siblings }: Props) {
  const others = useMemo(() => siblings.filter(f => f.id !== current.id), [siblings, current.id])
  const [compareToId, setCompareToId] = useState<string>(others[0]?.id ?? '')
  const other = others.find(f => f.id === compareToId)

  const diff = useMemo(() => other ? diffIngredients(other.ingredients, current.ingredients) : [], [other, current])
  const added = diff.filter(d => d.kind === 'added').length
  const removed = diff.filter(d => d.kind === 'removed').length
  const changed = diff.filter(d => d.kind === 'changed').length

  return (
    <Modal open={open} onClose={onClose} title="Compare Formulations" size="lg">
      {others.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No other formulations in this project to compare against.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">From (base)</label>
              <select
                value={compareToId}
                onChange={(e) => setCompareToId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none bg-white"
              >
                {others.map(f => (
                  <option key={f.id} value={f.id}>{f.versionLabel} — {f.name}</option>
                ))}
              </select>
            </div>
            <ArrowRight size={18} className="text-slate-300 mt-6 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">To (current)</label>
              <div className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-700">
                {current.versionLabel} — {current.name}
              </div>
            </div>
          </div>

          {other && (
            <>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                  <Plus size={11} /> {added} added
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium">
                  <Minus size={11} /> {removed} removed
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                  <Equal size={11} /> {changed} changed
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold w-10"></th>
                      <th className="px-3 py-2 text-left font-semibold">Ingredient</th>
                      <th className="px-3 py-2 text-left font-semibold">{other.versionLabel}</th>
                      <th className="px-3 py-2 text-left font-semibold">{current.versionLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diff.map((d, i) => {
                      const rowCls =
                        d.kind === 'added' ? 'bg-green-50/40' :
                        d.kind === 'removed' ? 'bg-red-50/40' :
                        d.kind === 'changed' ? 'bg-amber-50/40' :
                        ''
                      return (
                        <tr key={i} className={`border-b border-slate-100 last:border-0 ${rowCls}`}>
                          <td className="px-3 py-2 text-center">
                            {d.kind === 'added'     && <Plus size={12} className="text-green-600 inline" />}
                            {d.kind === 'removed'   && <Minus size={12} className="text-red-600 inline" />}
                            {d.kind === 'changed'   && <Equal size={12} className="text-amber-600 inline" />}
                            {d.kind === 'unchanged' && <span className="text-slate-300">·</span>}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-700">{d.name}</td>
                          <td className="px-3 py-2 text-slate-500">
                            {d.kind === 'added' ? <span className="text-slate-300 italic">—</span> :
                              d.kind === 'removed' ? ingredientSummary(d.from) :
                              d.kind === 'changed' ? ingredientSummary(d.from) :
                              ingredientSummary(d.ing)}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {d.kind === 'removed' ? <span className="text-slate-300 italic">—</span> :
                              d.kind === 'added' ? ingredientSummary(d.to) :
                              d.kind === 'changed' ? ingredientSummary(d.to) :
                              ingredientSummary(d.ing)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {(other.processNotes !== current.processNotes || other.targetProfile !== current.targetProfile) && (
                <div className="space-y-3 pt-2">
                  {other.processNotes !== current.processNotes && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{other.versionLabel} Process Notes</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{other.processNotes || <span className="text-slate-300">(none)</span>}</p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-indigo-500 uppercase mb-1">{current.versionLabel} Process Notes</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{current.processNotes || <span className="text-slate-300">(none)</span>}</p>
                      </div>
                    </div>
                  )}
                  {other.targetProfile !== current.targetProfile && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{other.versionLabel} Target Profile</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{other.targetProfile || <span className="text-slate-300">(none)</span>}</p>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-indigo-500 uppercase mb-1">{current.versionLabel} Target Profile</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{current.targetProfile || <span className="text-slate-300">(none)</span>}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
