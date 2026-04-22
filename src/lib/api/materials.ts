import { supabase } from '../supabase'
import type { Material } from '../../types'
import { rowToMaterial, materialToRow } from './mappers'

export async function listMaterials(): Promise<Material[]> {
  const { data, error } = await supabase.from('materials').select('*').order('material_code')
  if (error) throw error
  return (data ?? []).map(rowToMaterial)
}

export async function createMaterial(
  input: Omit<Material, 'id' | 'lastUpdated'>
): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .insert(materialToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToMaterial(data)
}

export async function updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .update(materialToRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToMaterial(data)
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}
