export interface Action {
  id: string
  stage: string
  action_list: string
  owner: string
  impact_quarter: string
  kpi: string
  status: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

export interface ActionVersion {
  id: string
  action_id: string
  stage: string
  action_list: string
  owner: string
  impact_quarter: string
  kpi: string
  status: boolean
  archived: boolean
  saved_at: string
  version_label: string
}

export type FilterState = {
  owner: string
  quarter: string
  stage: string
  status: string
  search: string
}
