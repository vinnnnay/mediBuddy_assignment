import type { ReactNode } from 'react'
import { Card, Stack, Text } from '@mantine/core'

type StateMessageProps = {
  title: string
  description: string
  action?: ReactNode
}

export default function StateMessage({
  title,
  description,
  action,
}: StateMessageProps) {
  return (
    <Card padding="xl" bg="white">
      <Stack gap={6} align="center" ta="center">
        <Text fw={600}>{title}</Text>
        <Text size="sm" c="dimmed" maw={420}>
          {description}
        </Text>
        {action}
      </Stack>
    </Card>
  )
}
