import { Stack, Text, Title } from '@mantine/core'

export default function SearchPage() {
  return (
    <Stack gap={6}>
      <Title order={2}>Search medicines</Title>
      <Text c="dimmed">
        Look up a brand name to see its label information from the FDA.
      </Text>
    </Stack>
  )
}
