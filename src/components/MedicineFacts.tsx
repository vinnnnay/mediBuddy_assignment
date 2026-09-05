import { SimpleGrid, Stack, Text } from '@mantine/core'
import type { MedicineDetail } from '../api/medicine'
import { toTitleCase } from '../lib/format'

type MedicineFactsProps = {
  medicine: MedicineDetail
}

type Fact = {
  label: string
  value: string
}

function buildFacts(medicine: MedicineDetail): Fact[] {
  const facts: Fact[] = []

  const push = (label: string, value: string | null) => {
    if (value) {
      facts.push({ label, value })
    }
  }

  push('Generic name', medicine.genericName && toTitleCase(medicine.genericName))
  push('Manufacturer', medicine.manufacturer)
  push('Product type', medicine.productType && toTitleCase(medicine.productType))
  push('Route', medicine.routes.map(toTitleCase).join(', ') || null)
  push('Active substances', medicine.substances.map(toTitleCase).join(', ') || null)
  push('Pharmacologic class', medicine.pharmClasses.join(', ') || null)
  push('Product NDC', medicine.productNdc.join(', ') || null)
  push('Application number', medicine.applicationNumber)
  push('RxCUI', medicine.rxcui.join(', ') || null)
  push('UNII', medicine.unii.join(', ') || null)
  push('Label updated', medicine.effectiveDate)

  return facts
}

export default function MedicineFacts({ medicine }: MedicineFactsProps) {
  const facts = buildFacts(medicine)

  if (facts.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        This label does not list any product details.
      </Text>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="sm">
      {facts.map((fact) => (
        <Stack key={fact.label} gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
            {fact.label}
          </Text>
          <Text size="sm">{fact.value}</Text>
        </Stack>
      ))}
    </SimpleGrid>
  )
}
