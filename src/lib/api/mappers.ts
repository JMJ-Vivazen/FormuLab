import type {
  Project,
  Formulation,
  Sample,
  SampleRecipient,
  Feedback,
  GateReview,
  Material,
  Ingredient,
  FeedbackRatings,
} from '../../types'

type Row = Record<string, unknown>

export function rowToProject(r: Row): Project {
  return {
    id: r.id as string,
    projectCode: r.project_code as string,
    name: r.name as string,
    category: r.category as string,
    description: r.description as string,
    targetProfile: r.target_profile as string,
    status: r.status as Project['status'],
    stage: r.stage as Project['stage'],
    priority: r.priority as Project['priority'],
    owner: r.owner as string,
    cmo: (r.cmo as string | null) ?? undefined,
    formulaFrozen: r.formula_frozen as boolean,
    qtpp: (r.qtpp as string | null) ?? undefined,
    targetActives: (r.target_actives as string | null) ?? undefined,
    shelfLifeTarget: (r.shelf_life_target as string | null) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

export function projectToRow(p: Partial<Project>): Row {
  const out: Row = {}
  if (p.projectCode !== undefined) out.project_code = p.projectCode
  if (p.name !== undefined) out.name = p.name
  if (p.category !== undefined) out.category = p.category
  if (p.description !== undefined) out.description = p.description
  if (p.targetProfile !== undefined) out.target_profile = p.targetProfile
  if (p.status !== undefined) out.status = p.status
  if (p.stage !== undefined) out.stage = p.stage
  if (p.priority !== undefined) out.priority = p.priority
  if (p.owner !== undefined) out.owner = p.owner
  if (p.cmo !== undefined) out.cmo = p.cmo ?? null
  if (p.formulaFrozen !== undefined) out.formula_frozen = p.formulaFrozen
  if (p.qtpp !== undefined) out.qtpp = p.qtpp ?? null
  if (p.targetActives !== undefined) out.target_actives = p.targetActives ?? null
  if (p.shelfLifeTarget !== undefined) out.shelf_life_target = p.shelfLifeTarget ?? null
  return out
}

export function rowToFormulation(r: Row): Formulation {
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    versionNumber: r.version_number as number,
    versionLabel: r.version_label as string,
    name: r.name as string,
    ingredients: (r.ingredients as Ingredient[]) ?? [],
    processNotes: r.process_notes as string,
    targetProfile: r.target_profile as string,
    status: r.status as Formulation['status'],
    frozen: r.frozen as boolean,
    parentId: (r.parent_id as string | null) ?? undefined,
    changeLog: r.change_log as string,
    labelImpact: (r.label_impact as string | null) ?? undefined,
    riskNotes: (r.risk_notes as string | null) ?? undefined,
    createdAt: r.created_at as string,
    createdBy: r.created_by as string,
  }
}

export function formulationToRow(f: Partial<Formulation>): Row {
  const out: Row = {}
  if (f.projectId !== undefined) out.project_id = f.projectId
  if (f.versionNumber !== undefined) out.version_number = f.versionNumber
  if (f.versionLabel !== undefined) out.version_label = f.versionLabel
  if (f.name !== undefined) out.name = f.name
  if (f.ingredients !== undefined) out.ingredients = f.ingredients
  if (f.processNotes !== undefined) out.process_notes = f.processNotes
  if (f.targetProfile !== undefined) out.target_profile = f.targetProfile
  if (f.status !== undefined) out.status = f.status
  if (f.frozen !== undefined) out.frozen = f.frozen
  if (f.parentId !== undefined) out.parent_id = f.parentId ?? null
  if (f.changeLog !== undefined) out.change_log = f.changeLog
  if (f.labelImpact !== undefined) out.label_impact = f.labelImpact ?? null
  if (f.riskNotes !== undefined) out.risk_notes = f.riskNotes ?? null
  if (f.createdBy !== undefined) out.created_by = f.createdBy
  return out
}

export function rowToSampleRecipient(r: Row): SampleRecipient {
  return {
    id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    dateSent: r.date_sent as string,
    feedbackReceived: r.feedback_received as boolean,
  }
}

export function rowToSample(r: Row, recipients: SampleRecipient[] = []): Sample {
  return {
    id: r.id as string,
    formulationId: r.formulation_id as string,
    projectId: r.project_id as string,
    batchCode: r.batch_code as string,
    rsln: (r.rsln as string | null) ?? undefined,
    sampleClass: r.sample_class as Sample['sampleClass'],
    lifecycleStatus: r.lifecycle_status as Sample['lifecycleStatus'],
    dateProduced: r.date_produced as string,
    quantity: Number(r.quantity ?? 0),
    quantityUnit: r.quantity_unit as string,
    recipients,
    status: r.status as Sample['status'],
    intendedUse: (r.intended_use as string | null) ?? undefined,
    storageCondition: (r.storage_condition as string | null) ?? undefined,
    site: (r.site as string | null) ?? undefined,
    externalDistribution: r.external_distribution as boolean,
    ingestionPossible: r.ingestion_possible as boolean,
    notes: r.notes as string,
    expiryDate: (r.expiry_date as string | null) ?? undefined,
    dispositionDate: (r.disposition_date as string | null) ?? undefined,
    dispositionMethod: (r.disposition_method as string | null) ?? undefined,
  }
}

export function sampleToRow(s: Partial<Sample>): Row {
  const out: Row = {}
  if (s.formulationId !== undefined) out.formulation_id = s.formulationId
  if (s.projectId !== undefined) out.project_id = s.projectId
  if (s.batchCode !== undefined) out.batch_code = s.batchCode
  if (s.rsln !== undefined) out.rsln = s.rsln ?? null
  if (s.sampleClass !== undefined) out.sample_class = s.sampleClass
  if (s.lifecycleStatus !== undefined) out.lifecycle_status = s.lifecycleStatus
  if (s.dateProduced !== undefined) out.date_produced = s.dateProduced
  if (s.quantity !== undefined) out.quantity = s.quantity
  if (s.quantityUnit !== undefined) out.quantity_unit = s.quantityUnit
  if (s.status !== undefined) out.status = s.status
  if (s.intendedUse !== undefined) out.intended_use = s.intendedUse ?? null
  if (s.storageCondition !== undefined) out.storage_condition = s.storageCondition ?? null
  if (s.site !== undefined) out.site = s.site ?? null
  if (s.externalDistribution !== undefined) out.external_distribution = s.externalDistribution
  if (s.ingestionPossible !== undefined) out.ingestion_possible = s.ingestionPossible
  if (s.notes !== undefined) out.notes = s.notes
  if (s.expiryDate !== undefined) out.expiry_date = s.expiryDate ?? null
  if (s.dispositionDate !== undefined) out.disposition_date = s.dispositionDate ?? null
  if (s.dispositionMethod !== undefined) out.disposition_method = s.dispositionMethod ?? null
  return out
}

export function recipientToRow(sampleId: string, r: Partial<SampleRecipient>): Row {
  return {
    sample_id: sampleId,
    name: r.name ?? '',
    role: r.role ?? '',
    date_sent: r.dateSent ?? null,
    feedback_received: r.feedbackReceived ?? false,
  }
}

export function rowToFeedback(r: Row): Feedback {
  return {
    id: r.id as string,
    sampleId: r.sample_id as string,
    formulationId: r.formulation_id as string,
    projectId: r.project_id as string,
    reviewerName: r.reviewer_name as string,
    reviewerRole: r.reviewer_role as string,
    date: r.date as string,
    ratings: (r.ratings as FeedbackRatings) ?? {},
    overallScore: Number(r.overall_score ?? 0),
    positives: r.positives as string,
    negatives: r.negatives as string,
    suggestions: r.suggestions as string,
    recommendReformulation: r.recommend_reformulation as boolean,
  }
}

export function feedbackToRow(f: Partial<Feedback>): Row {
  const out: Row = {}
  if (f.sampleId !== undefined) out.sample_id = f.sampleId
  if (f.formulationId !== undefined) out.formulation_id = f.formulationId
  if (f.projectId !== undefined) out.project_id = f.projectId
  if (f.reviewerName !== undefined) out.reviewer_name = f.reviewerName
  if (f.reviewerRole !== undefined) out.reviewer_role = f.reviewerRole
  if (f.ratings !== undefined) out.ratings = f.ratings
  if (f.overallScore !== undefined) out.overall_score = f.overallScore
  if (f.positives !== undefined) out.positives = f.positives
  if (f.negatives !== undefined) out.negatives = f.negatives
  if (f.suggestions !== undefined) out.suggestions = f.suggestions
  if (f.recommendReformulation !== undefined) out.recommend_reformulation = f.recommendReformulation
  return out
}

export function rowToGateReview(r: Row): GateReview {
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    gate: r.gate as GateReview['gate'],
    plannedDate: (r.planned_date as string | null) ?? undefined,
    actualDate: (r.actual_date as string | null) ?? undefined,
    reviewers: r.reviewers as string,
    decision: r.decision as GateReview['decision'],
    conditions: (r.conditions as string | null) ?? undefined,
    conditionOwner: (r.condition_owner as string | null) ?? undefined,
    conditionDueDate: (r.condition_due_date as string | null) ?? undefined,
    evidenceNotes: (r.evidence_notes as string | null) ?? undefined,
    createdAt: r.created_at as string,
    createdBy: r.created_by as string,
  }
}

export function gateReviewToRow(g: Partial<GateReview>): Row {
  const out: Row = {}
  if (g.projectId !== undefined) out.project_id = g.projectId
  if (g.gate !== undefined) out.gate = g.gate
  if (g.plannedDate !== undefined) out.planned_date = g.plannedDate ?? null
  if (g.actualDate !== undefined) out.actual_date = g.actualDate ?? null
  if (g.reviewers !== undefined) out.reviewers = g.reviewers
  if (g.decision !== undefined) out.decision = g.decision
  if (g.conditions !== undefined) out.conditions = g.conditions ?? null
  if (g.conditionOwner !== undefined) out.condition_owner = g.conditionOwner ?? null
  if (g.conditionDueDate !== undefined) out.condition_due_date = g.conditionDueDate ?? null
  if (g.evidenceNotes !== undefined) out.evidence_notes = g.evidenceNotes ?? null
  if (g.createdBy !== undefined) out.created_by = g.createdBy
  return out
}

export function rowToMaterial(r: Row): Material {
  const standardCostRaw = r.standard_cost as string | number | null
  return {
    id: r.id as string,
    materialCode: r.material_code as string,
    name: r.name as string,
    supplier: (r.supplier as string | null) ?? undefined,
    category: (r.category as string | null) ?? undefined,
    coaStatus: r.coa_status as Material['coaStatus'],
    rdApproved: r.rd_approved as boolean,
    commercialReady: r.commercial_ready as boolean,
    notes: (r.notes as string | null) ?? undefined,
    lastUpdated: r.updated_at as string,
    netsuiteItemId: (r.netsuite_item_id as number | null) ?? undefined,
    standardCost: standardCostRaw == null ? undefined : Number(standardCostRaw),
    costCurrency: (r.cost_currency as string | null) ?? undefined,
    costSyncedAt: (r.cost_synced_at as string | null) ?? undefined,
    baseUnit: (r.base_unit as string | null) ?? undefined,
    purchaseDescription: (r.purchase_description as string | null) ?? undefined,
  }
}

export function materialToRow(m: Partial<Material>): Row {
  const out: Row = {}
  if (m.materialCode !== undefined) out.material_code = m.materialCode
  if (m.name !== undefined) out.name = m.name
  if (m.supplier !== undefined) out.supplier = m.supplier ?? null
  if (m.category !== undefined) out.category = m.category ?? null
  if (m.coaStatus !== undefined) out.coa_status = m.coaStatus
  if (m.rdApproved !== undefined) out.rd_approved = m.rdApproved
  if (m.commercialReady !== undefined) out.commercial_ready = m.commercialReady
  if (m.notes !== undefined) out.notes = m.notes ?? null
  if (m.netsuiteItemId !== undefined) out.netsuite_item_id = m.netsuiteItemId ?? null
  if (m.standardCost !== undefined) out.standard_cost = m.standardCost ?? null
  if (m.costCurrency !== undefined) out.cost_currency = m.costCurrency ?? null
  if (m.costSyncedAt !== undefined) out.cost_synced_at = m.costSyncedAt ?? null
  if (m.baseUnit !== undefined) out.base_unit = m.baseUnit ?? null
  if (m.purchaseDescription !== undefined) out.purchase_description = m.purchaseDescription ?? null
  return out
}
