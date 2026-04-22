import { supabase } from '../supabase'
import type { Sample, SampleRecipient } from '../../types'
import { rowToSample, sampleToRow, rowToSampleRecipient, recipientToRow } from './mappers'

export async function listSamples(): Promise<Sample[]> {
  const { data: samples, error } = await supabase
    .from('samples')
    .select('*, sample_recipients(*)')
    .order('created_at')
  if (error) throw error
  return (samples ?? []).map((s) => {
    const recipients = (s.sample_recipients ?? []).map(rowToSampleRecipient)
    return rowToSample(s, recipients)
  })
}

export async function getSample(id: string): Promise<Sample | null> {
  const { data, error } = await supabase
    .from('samples')
    .select('*, sample_recipients(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const recipients = (data.sample_recipients ?? []).map(rowToSampleRecipient)
  return rowToSample(data, recipients)
}

export async function createSample(input: Omit<Sample, 'id'>): Promise<Sample> {
  const { recipients, ...rest } = input
  const { data, error } = await supabase
    .from('samples')
    .insert(sampleToRow(rest))
    .select()
    .single()
  if (error) throw error
  if (recipients?.length) {
    const { error: rErr } = await supabase
      .from('sample_recipients')
      .insert(recipients.map((r) => recipientToRow(data.id, r)))
    if (rErr) throw rErr
  }
  return (await getSample(data.id))!
}

export async function updateSample(id: string, updates: Partial<Sample>): Promise<Sample> {
  const { recipients, ...rest } = updates
  if (Object.keys(rest).length > 0) {
    const { error } = await supabase.from('samples').update(sampleToRow(rest)).eq('id', id)
    if (error) throw error
  }
  if (recipients !== undefined) {
    await supabase.from('sample_recipients').delete().eq('sample_id', id)
    if (recipients.length > 0) {
      const { error } = await supabase
        .from('sample_recipients')
        .insert(recipients.map((r) => recipientToRow(id, r)))
      if (error) throw error
    }
  }
  return (await getSample(id))!
}

export async function deleteSample(id: string): Promise<void> {
  const { error } = await supabase.from('samples').delete().eq('id', id)
  if (error) throw error
}

export async function replaceRecipients(
  sampleId: string,
  recipients: SampleRecipient[]
): Promise<void> {
  await supabase.from('sample_recipients').delete().eq('sample_id', sampleId)
  if (recipients.length > 0) {
    const { error } = await supabase
      .from('sample_recipients')
      .insert(recipients.map((r) => recipientToRow(sampleId, r)))
    if (error) throw error
  }
}
