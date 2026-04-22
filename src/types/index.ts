export type ProjectStatus = 'active' | 'on-hold' | 'completed'
export type GateStage = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'archived'
export type GateDecision = 'GO' | 'GO with Conditions' | 'HOLD' | 'RECYCLE' | 'pending'
export type FormulationStatus = 'draft' | 'in-testing' | 'approved' | 'rejected' | 'archived'
export type SampleClass = 'A' | 'B' | 'C'
export type SampleStatus = 'produced' | 'distributed' | 'in-review' | 'feedback-complete'
export type SampleLifecycleStatus =
  | 'requested'
  | 'pending-assignment'
  | 'assigned'
  | 'labeled'
  | 'quarantine'
  | 'released'
  | 'in-storage'
  | 'in-transit'
  | 'at-recipient'
  | 'at-review-date'
  | 'extended'
  | 'consumed'
  | 'returned'
  | 'destroyed'
  | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type CoaStatus = 'pending' | 'received' | 'approved' | 'rejected'

export interface Ingredient {
  id: string
  name: string
  supplier?: string
  amount: number
  unit: string
  percentage?: number
  category: string
  notes?: string
}

export interface Formulation {
  id: string
  projectId: string
  versionNumber: number
  versionLabel: string
  name: string
  ingredients: Ingredient[]
  processNotes: string
  targetProfile: string
  status: FormulationStatus
  frozen: boolean
  parentId?: string
  changeLog: string
  labelImpact?: string
  riskNotes?: string
  createdAt: string
  createdBy: string
}

export interface SampleRecipient {
  id: string
  name: string
  role: string
  dateSent: string
  feedbackReceived: boolean
}

export interface Sample {
  id: string
  formulationId: string
  projectId: string
  batchCode: string
  rsln?: string
  sampleClass: SampleClass
  lifecycleStatus: SampleLifecycleStatus
  dateProduced: string
  quantity: number
  quantityUnit: string
  recipients: SampleRecipient[]
  status: SampleStatus
  intendedUse?: string
  storageCondition?: string
  site?: string
  externalDistribution: boolean
  ingestionPossible: boolean
  notes: string
  expiryDate?: string
  dispositionDate?: string
  dispositionMethod?: string
}

export interface FeedbackRatings {
  taste?: number
  aroma?: number
  appearance?: number
  texture?: number
  aftertaste?: number
  overall?: number
  [key: string]: number | undefined
}

export interface Feedback {
  id: string
  sampleId: string
  formulationId: string
  projectId: string
  reviewerName: string
  reviewerRole: string
  date: string
  ratings: FeedbackRatings
  overallScore: number
  positives: string
  negatives: string
  suggestions: string
  recommendReformulation: boolean
}

export interface Project {
  id: string
  projectCode: string
  name: string
  category: string
  description: string
  targetProfile: string
  status: ProjectStatus
  stage: GateStage
  priority: Priority
  owner: string
  cmo?: string
  formulaFrozen: boolean
  qtpp?: string
  targetActives?: string
  shelfLifeTarget?: string
  createdAt: string
  updatedAt: string
}

export interface GateReview {
  id: string
  projectId: string
  gate: GateStage
  plannedDate?: string
  actualDate?: string
  reviewers: string
  decision: GateDecision
  conditions?: string
  conditionOwner?: string
  conditionDueDate?: string
  evidenceNotes?: string
  createdAt: string
  createdBy: string
}

export interface Material {
  id: string
  materialCode: string
  name: string
  supplier: string
  category: string
  coaStatus: CoaStatus
  rdApproved: boolean
  commercialReady: boolean
  notes?: string
  lastUpdated: string
}

export interface AppState {
  projects: Project[]
  formulations: Formulation[]
  samples: Sample[]
  feedback: Feedback[]
  gateReviews: GateReview[]
  materials: Material[]

  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  addFormulation: (f: Omit<Formulation, 'id' | 'createdAt'>) => void
  updateFormulation: (id: string, updates: Partial<Formulation>) => void
  deleteFormulation: (id: string) => void

  addSample: (s: Omit<Sample, 'id'>) => void
  updateSample: (id: string, updates: Partial<Sample>) => void
  deleteSample: (id: string) => void

  addFeedback: (f: Omit<Feedback, 'id' | 'date'>) => void
  updateFeedback: (id: string, updates: Partial<Feedback>) => void
  deleteFeedback: (id: string) => void

  addGateReview: (g: Omit<GateReview, 'id' | 'createdAt'>) => void
  updateGateReview: (id: string, updates: Partial<GateReview>) => void
  deleteGateReview: (id: string) => void

  addMaterial: (m: Omit<Material, 'id' | 'lastUpdated'>) => void
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void
}
