export type OpenFdaFields = {
  brand_name?: string[]
  generic_name?: string[]
  manufacturer_name?: string[]
  product_type?: string[]
  route?: string[]
  substance_name?: string[]
  product_ndc?: string[]
  package_ndc?: string[]
  application_number?: string[]
  pharm_class_epc?: string[]
  pharm_class_moa?: string[]
  pharm_class_cs?: string[]
  rxcui?: string[]
  unii?: string[]
  spl_set_id?: string[]
  is_original_packager?: boolean[]
}

export type LabelSectionKey =
  | 'description'
  | 'purpose'
  | 'indications_and_usage'
  | 'dosage_and_administration'
  | 'active_ingredient'
  | 'inactive_ingredient'
  | 'warnings'
  | 'do_not_use'
  | 'ask_doctor'
  | 'ask_doctor_or_pharmacist'
  | 'when_using'
  | 'stop_use'
  | 'pregnancy_or_breast_feeding'
  | 'keep_out_of_reach_of_children'
  | 'contraindications'
  | 'adverse_reactions'
  | 'storage_and_handling'

export type DrugLabel = {
  id: string
  effective_time?: string
  version?: string
  openfda?: OpenFdaFields
} & Partial<Record<LabelSectionKey, string[]>>

export type DrugLabelResponse = {
  meta?: {
    results?: {
      skip: number
      limit: number
      total: number
    }
  }
  results?: DrugLabel[]
}

export type FdaErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}
