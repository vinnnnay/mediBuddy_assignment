import { useParams } from 'react-router-dom'
import { Stack, Text, Title } from '@mantine/core'

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Stack gap={6}>
      <Title order={2}>Medicine detail</Title>
      <Text c="dimmed">{id}</Text>
    </Stack>
  )
}
