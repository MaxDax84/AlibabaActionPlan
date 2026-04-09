export interface Action {
  id: string
  task_id: string
  domain: string
  stage: string        // = Section (Business Analysis & Platform, etc.)
  action_list: string
  owner: string
  kpi: string          // displayed as "Metric" in UI
  status: boolean
  archived: boolean
  created_at: string
  updated_at: string
  // kept in DB for backward compat, not shown in UI
  impact_quarter?: string
}

export interface ActionVersion {
  id: string
  snapshot: unknown[]
  version_label: string
  saved_at: string
}

export type FilterState = {
  owner: string
  domain: string
  stage: string
  status: string
  search: string
}
