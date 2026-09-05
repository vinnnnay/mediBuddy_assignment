import type { DrugLabel, OpenFdaFields } from './types'

export type Medicine = {
  id: string
  brandName: string
  otherBrandNames: string[]
  genericName: string | null
  manufacturer: string | null
  productType: string | null
  routes: string[]
  substances: string[]
  productNdc: string[]
  applicationNumber: string | null
  pharmClasses: string[]
  rxcui: string[]
  unii: string[]
  effectiveDate: string | null
}

function values(field: string[] | undefined): string[] {
  if (!field) {
    return []
  }

  const seen = new Set<string>()

  for (const value of field) {
    const trimmed = typeof value === 'string' ? value.trim() : ''
    if (trimmed) {
      seen.add(trimmed)
    }
  }

  return [...seen]
}

function firstValue(field: string[] | undefined): string | null {
  return values(field)[0] ?? null
}

function resolveBrandName(openfda: OpenFdaFields): string {
  return (
    firstValue(openfda.brand_name) ??
    firstValue(openfda.generic_name) ??
    firstValue(openfda.substance_name) ??
    'Unnamed product'
  )
}

function parseEffectiveTime(effectiveTime: string | undefined): string | null {
  if (!effectiveTime || !/^\d{8}$/.test(effectiveTime)) {
    return null
  }

  const year = Number(effectiveTime.slice(0, 4))
  const month = Number(effectiveTime.slice(4, 6))
  const day = Number(effectiveTime.slice(6, 8))
  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function toMedicine(label: DrugLabel): Medicine {
  const openfda = label.openfda ?? {}
  const brandNames = values(openfda.brand_name)
  const brandName = resolveBrandName(openfda)

  return {
    id: label.id,
    brandName,
    otherBrandNames: brandNames.filter((name) => name !== brandName),
    genericName: firstValue(openfda.generic_name),
    manufacturer: firstValue(openfda.manufacturer_name),
    productType: firstValue(openfda.product_type),
    routes: values(openfda.route),
    substances: values(openfda.substance_name),
    productNdc: values(openfda.product_ndc),
    applicationNumber: firstValue(openfda.application_number),
    pharmClasses: [
      ...values(openfda.pharm_class_epc),
      ...values(openfda.pharm_class_moa),
      ...values(openfda.pharm_class_cs),
    ],
    rxcui: values(openfda.rxcui),
    unii: values(openfda.unii),
    effectiveDate: parseEffectiveTime(label.effective_time),
  }
}

export function toMedicines(labels: DrugLabel[]): Medicine[] {
  return labels.map(toMedicine)
}
