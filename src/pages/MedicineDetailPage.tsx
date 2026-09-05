import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  Accordion,
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import StateMessage from '../components/StateMessage'
import MedicineFacts from '../components/MedicineFacts'
import { useMedicineDetail } from '../hooks/useMedicineDetail'
import { toTitleCase } from '../lib/format'

function DetailSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={28} width="55%" />
      <Skeleton height={16} width="30%" />
      <Card padding="lg">
        <Stack gap="sm">
          <Skeleton height={12} width="80%" />
          <Skeleton height={12} width="60%" />
          <Skeleton height={12} width="70%" />
        </Stack>
      </Card>
    </Stack>
  )
}

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { state, retry } = useMedicineDetail(id)

  const previousQuery = searchParams.get('q') ?? ''
  const backTo = previousQuery
    ? `/?q=${encodeURIComponent(previousQuery)}`
    : '/'
  const backLabel = previousQuery
    ? `Back to results for "${previousQuery}"`
    : 'Back to search'

  return (
    <Stack gap="lg">
      <Anchor component={Link} to={backTo} size="sm" fw={500}>
        &larr; {backLabel}
      </Anchor>

      {state.status === 'loading' && <DetailSkeleton />}

      {state.status === 'error' && (
        <StateMessage
          title="Something went wrong"
          description={state.error ?? 'This medicine could not be loaded.'}
          action={
            <Button mt="xs" variant="light" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {state.status === 'missing' && (
        <StateMessage
          title="Medicine not found"
          description="This label is no longer available from the FDA, or the link is incorrect."
          action={
            <Button mt="xs" variant="light" component={Link} to="/">
              Back to search
            </Button>
          }
        />
      )}

      {state.status === 'success' && state.medicine && (
        <Stack gap="lg">
          <Stack gap={6}>
            <Title order={1} size="h2">
              {state.medicine.brandName}
            </Title>
            {state.medicine.genericName && (
              <Text c="dimmed">{toTitleCase(state.medicine.genericName)}</Text>
            )}
            <Group gap="xs" mt={4}>
              {state.medicine.productType && (
                <Badge variant="light" color="teal">
                  {toTitleCase(state.medicine.productType)}
                </Badge>
              )}
              {state.medicine.routes.map((route) => (
                <Badge key={route} variant="default">
                  {toTitleCase(route)}
                </Badge>
              ))}
            </Group>
          </Stack>

          <Card padding="lg" bg="white">
            <Stack gap="md">
              <Text fw={600}>Product details</Text>
              <Divider />
              <MedicineFacts medicine={state.medicine} />
            </Stack>
          </Card>

          {state.medicine.otherBrandNames.length > 0 && (
            <Card padding="lg" bg="white">
              <Stack gap="xs">
                <Text fw={600}>Also sold as</Text>
                <Text size="sm" c="dimmed">
                  {state.medicine.otherBrandNames.join(', ')}
                </Text>
              </Stack>
            </Card>
          )}

          {state.medicine.sections.length > 0 && (
            <Stack gap="sm">
              <Text fw={600}>From the label</Text>
              <Accordion variant="separated" radius="md">
                {state.medicine.sections.map((section) => (
                  <Accordion.Item key={section.key} value={section.key}>
                    <Accordion.Control>{section.title}</Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {section.body}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}
