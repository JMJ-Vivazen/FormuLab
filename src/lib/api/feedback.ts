import { supabase } from '../supabase'
import type { Feedback } from '../../types'
import { rowToFeedback, feedbackToRow } from './mappers'

export async function listFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase.from('feedback').select('*').order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToFeedback)
}

export async function createFeedback(input: Omit<Feedback, 'id' | 'date'>): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedbackToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToFeedback(data)
}

export async function updateFeedback(id: string, updates: Partial<Feedback>): Promise<Feedback> {
  const { data, error } = await supabase
    .from('feedback')
    .update(feedbackToRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToFeedback(data)
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id)
  if (error) throw error
}
