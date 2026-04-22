import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { AppState } from '../types'
import * as projectsApi from '../lib/api/projects'
import * as formulationsApi from '../lib/api/formulations'
import * as samplesApi from '../lib/api/samples'
import * as feedbackApi from '../lib/api/feedback'
import * as gateReviewsApi from '../lib/api/gateReviews'
import * as materialsApi from '../lib/api/materials'

// Drop-in replacement for the legacy Zustand store. Same destructuring API,
// now backed by Supabase via React Query.
export function useStore(): AppState {
  const qc = useQueryClient()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.listProjects,
  })
  const { data: formulations = [] } = useQuery({
    queryKey: ['formulations'],
    queryFn: formulationsApi.listFormulations,
  })
  const { data: samples = [] } = useQuery({
    queryKey: ['samples'],
    queryFn: samplesApi.listSamples,
  })
  const { data: feedback = [] } = useQuery({
    queryKey: ['feedback'],
    queryFn: feedbackApi.listFeedback,
  })
  const { data: gateReviews = [] } = useQuery({
    queryKey: ['gate_reviews'],
    queryFn: gateReviewsApi.listGateReviews,
  })
  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: materialsApi.listMaterials,
  })

  const actions = useMemo<Omit<AppState, 'projects' | 'formulations' | 'samples' | 'feedback' | 'gateReviews' | 'materials'>>(
    () => ({
      addProject: (p) => {
        projectsApi.createProject(p).then(() => qc.invalidateQueries({ queryKey: ['projects'] }))
      },
      updateProject: (id, updates) => {
        projectsApi.updateProject(id, updates).then(() => qc.invalidateQueries({ queryKey: ['projects'] }))
      },
      deleteProject: (id) => {
        projectsApi.deleteProject(id).then(() => {
          qc.invalidateQueries({ queryKey: ['projects'] })
          qc.invalidateQueries({ queryKey: ['formulations'] })
          qc.invalidateQueries({ queryKey: ['samples'] })
          qc.invalidateQueries({ queryKey: ['feedback'] })
          qc.invalidateQueries({ queryKey: ['gate_reviews'] })
        })
      },

      addFormulation: (f) => {
        formulationsApi
          .createFormulation(f)
          .then(() => qc.invalidateQueries({ queryKey: ['formulations'] }))
      },
      updateFormulation: (id, updates) => {
        formulationsApi
          .updateFormulation(id, updates)
          .then(() => qc.invalidateQueries({ queryKey: ['formulations'] }))
      },
      deleteFormulation: (id) => {
        formulationsApi.deleteFormulation(id).then(() => {
          qc.invalidateQueries({ queryKey: ['formulations'] })
          qc.invalidateQueries({ queryKey: ['samples'] })
          qc.invalidateQueries({ queryKey: ['feedback'] })
        })
      },

      addSample: (s) => {
        samplesApi.createSample(s).then(() => qc.invalidateQueries({ queryKey: ['samples'] }))
      },
      updateSample: (id, updates) => {
        samplesApi
          .updateSample(id, updates)
          .then(() => qc.invalidateQueries({ queryKey: ['samples'] }))
      },
      deleteSample: (id) => {
        samplesApi.deleteSample(id).then(() => {
          qc.invalidateQueries({ queryKey: ['samples'] })
          qc.invalidateQueries({ queryKey: ['feedback'] })
        })
      },

      addFeedback: (f) => {
        feedbackApi.createFeedback(f).then(() => qc.invalidateQueries({ queryKey: ['feedback'] }))
      },
      updateFeedback: (id, updates) => {
        feedbackApi
          .updateFeedback(id, updates)
          .then(() => qc.invalidateQueries({ queryKey: ['feedback'] }))
      },
      deleteFeedback: (id) => {
        feedbackApi.deleteFeedback(id).then(() => qc.invalidateQueries({ queryKey: ['feedback'] }))
      },

      addGateReview: (g) => {
        gateReviewsApi
          .createGateReview(g)
          .then(() => qc.invalidateQueries({ queryKey: ['gate_reviews'] }))
      },
      updateGateReview: (id, updates) => {
        gateReviewsApi
          .updateGateReview(id, updates)
          .then(() => qc.invalidateQueries({ queryKey: ['gate_reviews'] }))
      },
      deleteGateReview: (id) => {
        gateReviewsApi
          .deleteGateReview(id)
          .then(() => qc.invalidateQueries({ queryKey: ['gate_reviews'] }))
      },

      addMaterial: (m) => {
        materialsApi
          .createMaterial(m)
          .then(() => qc.invalidateQueries({ queryKey: ['materials'] }))
      },
      updateMaterial: (id, updates) => {
        materialsApi
          .updateMaterial(id, updates)
          .then(() => qc.invalidateQueries({ queryKey: ['materials'] }))
      },
      deleteMaterial: (id) => {
        materialsApi.deleteMaterial(id).then(() => qc.invalidateQueries({ queryKey: ['materials'] }))
      },
    }),
    [qc]
  )

  return {
    projects,
    formulations,
    samples,
    feedback,
    gateReviews,
    materials,
    ...actions,
  }
}
