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

export type DrugLabel = {
  id: string
  effective_time?: string
  version?: string
  openfda?: OpenFdaFields
}

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
