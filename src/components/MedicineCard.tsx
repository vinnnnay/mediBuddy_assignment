import { Link } from 'react-router-dom'
import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { Medicine } from '../api/medicine'
import { formatList, toTitleCase } from '../lib/format'
import classes from './MedicineCard.module.css'

type MedicineCardProps = {
  medicine: Medicine
}

type MetaRowProps = {
  label: string
  value: string
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <Group gap={6} wrap="nowrap" align="baseline">
      <Text size="xs" c="dimmed" w={92} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" lineClamp={1}>
        {value}
      </Text>
    </Group>
  )
}

function productTypeBadge(productType: string | null) {
  if (!productType) {
    return null
  }

  const isPrescription = productType.toUpperCase().includes('PRESCRIPTION')

  return (
    <Badge
      size="sm"
      variant="light"
      color={isPrescription ? 'indigo' : 'teal'}
      style={{ flexShrink: 0 }}
    >
      {isPrescription ? 'Prescription' : 'OTC'}
    </Badge>
  )
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const routes = formatList(medicine.routes)
  const substances = formatList(medicine.substances, 2)

  return (
    <Card
      component={Link}
      to={`/medicine/${medicine.id}`}
      padding="md"
      className={classes.card}
    >
      <Stack gap={10}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <Stack gap={2}>
            <Text fw={600} lineClamp={2}>
              {medicine.brandName}
            </Text>
            {medicine.genericName && (
              <Text size="sm" c="dimmed" lineClamp={1}>
                {toTitleCase(medicine.genericName)}
              </Text>
            )}
          </Stack>
          {productTypeBadge(medicine.productType)}
        </Group>

        <Stack gap={4}>
          {medicine.manufacturer && (
            <MetaRow label="Manufacturer" value={medicine.manufacturer} />
          )}
          {routes && <MetaRow label="Route" value={routes} />}
          {substances && <MetaRow label="Active" value={substances} />}
        </Stack>
      </Stack>
    </Card>
  )
}
