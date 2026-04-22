export * as projectsApi from './projects'
export * as formulationsApi from './formulations'
export * as samplesApi from './samples'
export * as feedbackApi from './feedback'
export * as gateReviewsApi from './gateReviews'
export * as materialsApi from './materials'

export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  formulations: ['formulations'] as const,
  formulation: (id: string) => ['formulations', id] as const,
  samples: ['samples'] as const,
  sample: (id: string) => ['samples', id] as const,
  feedback: ['feedback'] as const,
  gateReviews: ['gate_reviews'] as const,
  materials: ['materials'] as const,
}
