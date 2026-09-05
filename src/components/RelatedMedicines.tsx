import { SimpleGrid, Stack, Text } from '@mantine/core'
import type { Medicine } from '../api/medicine'
import MedicineCard from './MedicineCard'
import { toTitleCase } from '../lib/format'

type RelatedMedicinesProps = {
  substance: string
  medicines: Medicine[]
}

export default function RelatedMedicines({
  substance,
  medicines,
}: RelatedMedicinesProps) {
  if (medicines.length === 0) {
    return null
  }

  return (
    <Stack gap="sm">
      <Text fw={600}>
        Other products containing {toTitleCase(substance)}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {medicines.map((medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} query="" />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
