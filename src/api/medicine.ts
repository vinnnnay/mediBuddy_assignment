import type { DrugLabel, LabelSectionKey, OpenFdaFields } from './types'

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

export type LabelSection = {
  key: LabelSectionKey
  title: string
  body: string
}

export type MedicineDetail = Medicine & {
  sections: LabelSection[]
}

const SECTION_TITLES: Array<[LabelSectionKey, string]> = [
  ['description', 'Description'],
  ['purpose', 'Purpose'],
  ['indications_and_usage', 'Indications and usage'],
  ['dosage_and_administration', 'Dosage and administration'],
  ['active_ingredient', 'Active ingredient'],
  ['inactive_ingredient', 'Inactive ingredients'],
  ['warnings', 'Warnings'],
  ['do_not_use', 'Do not use'],
  ['ask_doctor', 'Ask a doctor'],
  ['ask_doctor_or_pharmacist', 'Ask a doctor or pharmacist'],
  ['when_using', 'When using this product'],
  ['stop_use', 'Stop use and ask a doctor'],
  ['pregnancy_or_breast_feeding', 'Pregnancy or breastfeeding'],
  ['keep_out_of_reach_of_children', 'Keep out of reach of children'],
  ['contraindications', 'Contraindications'],
  ['adverse_reactions', 'Adverse reactions'],
  ['storage_and_handling', 'Storage and handling'],
]

function sectionBody(field: string[] | undefined): string {
  if (!field) {
    return ''
  }

  return field
    .filter((entry) => typeof entry === 'string' && entry.trim())
    .map((entry) => entry.trim().replace(/[ \t]+/g, ' '))
    .join('\n\n')
}

export function toMedicineDetail(label: DrugLabel): MedicineDetail {
  const sections: LabelSection[] = []

  for (const [key, title] of SECTION_TITLES) {
    const body = sectionBody(label[key])

    if (body) {
      sections.push({ key, title, body })
    }
  }

  return { ...toMedicine(label), sections }
}
