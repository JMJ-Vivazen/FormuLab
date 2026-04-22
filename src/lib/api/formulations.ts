import { supabase } from '../supabase'
import type { Formulation } from '../../types'
import { rowToFormulation, formulationToRow } from './mappers'

export async function listFormulations(): Promise<Formulation[]> {
  const { data, error } = await supabase.from('formulations').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToFormulation)
}

export async function getFormulation(id: string): Promise<Formulation | null> {
  const { data, error } = await supabase
    .from('formulations')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? rowToFormulation(data) : null
}

export async function createFormulation(
  input: Omit<Formulation, 'id' | 'createdAt'>
): Promise<Formulation> {
  const { data, error } = await supabase
    .from('formulations')
    .insert(formulationToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToFormulation(data)
}

export async function updateFormulation(
  id: string,
  updates: Partial<Formulation>
): Promise<Formulation> {
  const { data, error } = await supabase
    .from('formulations')
    .update(formulationToRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToFormulation(data)
}

export async function deleteFormulation(id: string): Promise<void> {
  const { error } = await supabase.from('formulations').delete().eq('id', id)
  if (error) throw error
}
