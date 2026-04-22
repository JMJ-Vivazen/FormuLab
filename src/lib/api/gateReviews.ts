import { supabase } from '../supabase'
import type { GateReview } from '../../types'
import { rowToGateReview, gateReviewToRow } from './mappers'

export async function listGateReviews(): Promise<GateReview[]> {
  const { data, error } = await supabase
    .from('gate_reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToGateReview)
}

export async function createGateReview(
  input: Omit<GateReview, 'id' | 'createdAt'>
): Promise<GateReview> {
  const { data, error } = await supabase
    .from('gate_reviews')
    .insert(gateReviewToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToGateReview(data)
}

export async function updateGateReview(
  id: string,
  updates: Partial<GateReview>
): Promise<GateReview> {
  const { data, error } = await supabase
    .from('gate_reviews')
    .update(gateReviewToRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToGateReview(data)
}

export async function deleteGateReview(id: string): Promise<void> {
  const { error } = await supabase.from('gate_reviews').delete().eq('id', id)
  if (error) throw error
}
