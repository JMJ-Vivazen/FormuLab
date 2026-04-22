import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { Ingredient } from '../types'

const CATEGORIES = ['Base', 'Active', 'Flavor', 'Sweetener', 'Acidulant', 'Preservative', 'Color', 'Other']
const UNITS = ['g', 'mg', 'mL', '%', 'oz', 'kg', 'L', 'ppm', 'IU']

interface Props {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
  readOnly?: boolean
}

export function IngredientTable({ ingredients, onChange, readOnly = false }: Props) {
  const [newRow, setNewRow] = useState<Partial<Ingredient>>({ category: 'Base', unit: 'g', amount: 0 })

  const totalAmount = ingredients.reduce((sum, i) => sum + i.amount, 0)

  const update = (id: string, field: keyof Ingredient, value: string | number) => {
    onChange(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const remove = (id: string) => onChange(ingredients.filter((i) => i.id !== id))

  const addRow = () => {
    if (!newRow.name?.trim()) return
    onChange([...ingredients, { ...newRow, id: uuidv4() } as Ingredient])
    setNewRow({ category: 'Base', unit: 'g', amount: 0 })
  }

  const catColor: Record<string, string> = {
    Base: 'bg-slate-100 text-slate-600',
    Active: 'bg-indigo-100 text-indigo-700',
    Flavor: 'bg-orange-100 text-orange-700',
    Sweetener: 'bg-pink-100 text-pink-700',
    Acidulant: 'bg-yellow-100 text-yellow-700',
    Preservative: 'bg-red-100 text-red-700',
    Color: 'bg-purple-100 text-purple-700',
    Other: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2.5 font-medium text-slate-600">Ingredient</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-600">Category</th>
              <th className="text-right px-3 py-2.5 font-medium text-slate-600">Amount</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-600">Unit</th>
              <th className="text-right px-3 py-2.5 font-medium text-slate-600">%</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-600">Supplier</th>
              {!readOnly && <th className="px-3 py-2.5 w-8" />}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <tr key={ing.id} className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-medium text-slate-800">{ing.name}</span>
                  ) : (
                    <input
                      value={ing.name}
                      onChange={(e) => update(ing.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-0 outline-none font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor[ing.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ing.category}
                    </span>
                  ) : (
                    <select
                      value={ing.category}
                      onChange={(e) => update(ing.id, 'category', e.target.value)}
                      className="text-xs bg-transparent border-0 outline-none text-slate-700 focus:ring-1 focus:ring-indigo-300 rounded"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    <span className="text-slate-700">{ing.amount}</span>
                  ) : (
                    <input
                      type="number" value={ing.amount}
                      onChange={(e) => update(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-20 text-right bg-transparent border-0 outline-none text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-500 text-xs">{ing.unit}</span>
                  ) : (
                    <select
                      value={ing.unit}
                      onChange={(e) => update(ing.id, 'unit', e.target.value)}
                      className="text-xs bg-transparent border-0 outline-none text-slate-600 focus:ring-1 focus:ring-indigo-300 rounded"
                    >
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-slate-500 text-xs">
                  {ing.percentage != null ? `${ing.percentage.toFixed(1)}%` : '—'}
                </td>
                <td className="px-3 py-2 text-slate-500 text-xs">{ing.supplier ?? '—'}</td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button onClick={() => remove(ing.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {!readOnly && (
            <tfoot>
              <tr className="bg-indigo-50/60 border-t border-slate-200">
                <td className="px-3 py-2">
                  <input
                    placeholder="Ingredient name…"
                    value={newRow.name ?? ''}
                    onChange={(e) => setNewRow((r) => ({ ...r, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addRow()}
                    className="w-full bg-transparent border-0 outline-none text-sm text-slate-700 placeholder-slate-400"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={newRow.category}
                    onChange={(e) => setNewRow((r) => ({ ...r, category: e.target.value }))}
                    className="text-xs bg-transparent border-0 outline-none text-slate-600"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number" placeholder="0"
                    value={newRow.amount || ''}
                    onChange={(e) => setNewRow((r) => ({ ...r, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-20 text-right bg-transparent border-0 outline-none text-sm text-slate-700"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={newRow.unit}
                    onChange={(e) => setNewRow((r) => ({ ...r, unit: e.target.value }))}
                    className="text-xs bg-transparent border-0 outline-none text-slate-600"
                  >
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td />
                <td className="px-3 py-2">
                  <input
                    placeholder="Supplier"
                    value={newRow.supplier ?? ''}
                    onChange={(e) => setNewRow((r) => ({ ...r, supplier: e.target.value }))}
                    className="w-full bg-transparent border-0 outline-none text-xs text-slate-600 placeholder-slate-400"
                  />
                </td>
                <td className="px-3 py-2">
                  <button onClick={addRow} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                    <Plus size={16} />
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {totalAmount > 0 && (
        <p className="text-xs text-slate-400 mt-1.5 text-right">
          Total amount: <span className="font-medium text-slate-600">{totalAmount.toFixed(1)}</span> (mixed units)
        </p>
      )}
    </div>
  )
}
