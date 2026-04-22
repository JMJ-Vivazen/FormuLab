import { supabase } from '../supabase'
import type { Project } from '../../types'
import { rowToProject, projectToRow } from './mappers'

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToProject)
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToProject(data) : null
}

export async function createProject(
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToProject(data)
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(projectToRow(updates))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToProject(data)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
