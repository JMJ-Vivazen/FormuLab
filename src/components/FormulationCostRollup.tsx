import { useMemo } from 'react'
import { DollarSign, AlertCircle } from 'lucide-react'
import type { Ingredient, Material } from '../types'

type LineStatus = 'ok' | 'no-match' | 'no-cost' | 'unit-mismatch'

interface Line {
  ingredient: Ingredient
  material?: Material
  status: LineStatus
  convertedAmount?: number
  lineCost?: number
  note?: string
}

const MASS_KG: Record<string, number> = {
  kg: 1, kilogram: 1, kilograms: 1,
  g: 0.001, gram: 0.001, grams: 0.001,
  mg: 0.000001, milligram: 0.000001, milligrams: 0.000001,
}
const VOL_L: Record<string, number> = {
  l: 1, liter: 1, liters: 1, litre: 1, litres: 1,
  ml: 0.001, milliliter: 0.001, milliliters: 0.001,
}

function norm(u: string | undefined): string {
  return (u ?? '').trim().toLowerCase()
}

function convertedToBase(amount: number, unit: string, baseUnit: string): number | null {
  const u = norm(unit)
  const b = norm(baseUnit)
  if (!u && !b) return amount
  if (u === b) return amount
  if (b in MASS_KG && u in MASS_KG) return amount * (MASS_KG[u] / MASS_KG[b])
  if (b in VOL_L && u in VOL_L) return amount * (VOL_L[u] / VOL_L[b])
  if (b === 'ea' && (u === 'ea' || u === 'each' || u === 'unit' || u === 'units' || u === 'ct' || u === 'count')) return amount
  return null
}

function matchMaterial(ing: Ingredient, materials: Material[]): Material | undefined {
  const target = ing.name.trim().toLowerCase()
  if (!target) return undefined
  let exact = materials.find((m) => m.name.trim().toLowerCase() === target)
  if (exact) return exact
  exact = materials.find((m) => m.materialCode.trim().toLowerCase() === target)
  if (exact) return exact
  return materials.find((m) => m.name.toLowerCase().includes(target) || target.includes(m.name.toLowerCase()))
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4,
  }).format(value)
}

export function FormulationCostRollup({
  ingredients,
  materials,
  batchUnits,
}: {
  ingredients: Ingredient[]
  materials: Material[]
  batchUnits?: number
}) {
  const { lines, totalCost, matchedCount, unmatchedCount, noCostCount, unitMismatchCount } = useMemo(() => {
    let total = 0
    let matched = 0
    let unmatched = 0
    let noCost = 0
    let unitMismatch = 0
    const result: Line[] = ingredients.map((ing) => {
      const mat = matchMaterial(ing, materials)
      if (!mat) {
        unmatched++
        return { ingredient: ing, status: 'no-match' }
      }
      if (mat.standardCost == null) {
        noCost++
        return { ingredient: ing, material: mat, status: 'no-cost' }
      }
      const converted = convertedToBase(ing.amount, ing.unit, mat.baseUnit ?? '')
      if (converted == null) {
        unitMismatch++
        return {
          ingredient: ing, material: mat, status: 'unit-mismatch',
          note: `Cannot convert ${ing.unit || '—'} → ${mat.baseUnit || '—'}`,
        }
      }
      const cost = converted * mat.standardCost
      total += cost
      matched++
      return { ingredient: ing, material: mat, status: 'ok', convertedAmount: converted, lineCost: cost }
    })
    return {
      lines: result, totalCost: total,
      matchedCount: matched, unmatchedCount: unmatched, noCostCount: noCost, unitMismatchCount: unitMismatch,
    }
  }, [ingredients, materials])

  const perUnit = batchUnits && batchUnits > 0 ? totalCost / batchUnits : null

  if (ingredients.length === 0) return null

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Cost Roll-up</h3>
            <p className="text-xs text-slate-400">Standard cost from NetSuite · matched by material name</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800 font-mono">{formatUSD(totalCost)}</div>
          <div className="text-xs text-slate-400">Ingredients total</div>
          {perUnit != null && (
            <div className="text-xs text-emerald-700 mt-0.5 font-medium">{formatUSD(perUnit)} per unit</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="bg-emerald-50 rounded-lg px-2 py-1.5">
          <div className="text-sm font-bold text-emerald-700">{matchedCount}</div>
          <div className="text-[10px] text-emerald-600 uppercase tracking-wider">Priced</div>
        </div>
        <div className="bg-slate-50 rounded-lg px-2 py-1.5">
          <div className="text-sm font-bold text-slate-600">{unmatchedCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Unmatched</div>
        </div>
        <div className="bg-amber-50 rounded-lg px-2 py-1.5">
          <div className="text-sm font-bold text-amber-700">{noCostCount}</div>
          <div className="text-[10px] text-amber-600 uppercase tracking-wider">No Cost</div>
        </div>
        <div className="bg-rose-50 rounded-lg px-2 py-1.5">
          <div className="text-sm font-bold text-rose-700">{unitMismatchCount}</div>
          <div className="text-[10px] text-rose-600 uppercase tracking-wider">Unit Mismatch</div>
        </div>
      </div>

      {(unmatchedCount > 0 || noCostCount > 0 || unitMismatchCount > 0) && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Review {unmatchedCount + noCostCount + unitMismatchCount} ingredient{unmatchedCount + noCostCount + unitMismatchCount !== 1 ? 's' : ''} excluded from total
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-slate-600 pl-5">
            {lines.filter((l) => l.status !== 'ok').map((l) => (
              <li key={l.ingredient.id}>
                <span className="font-medium">{l.ingredient.name}</span>
                {l.status === 'no-match' && <span className="text-slate-400"> — no matching material in library</span>}
                {l.status === 'no-cost' && <span className="text-slate-400"> — material has no standard cost</span>}
                {l.status === 'unit-mismatch' && <span className="text-slate-400"> — {l.note}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
