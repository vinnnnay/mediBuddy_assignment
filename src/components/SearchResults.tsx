import { Button, Card, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import type { Medicine } from '../api/medicine'
import type { SearchState } from '../hooks/useMedicineSearch'
import MedicineCard from './MedicineCard'
import StateMessage from './StateMessage'

type SearchResultsProps = {
  state: SearchState
  query: string
  onRetry: () => void
}

const SKELETON_COUNT = 6

function ResultsGrid({ children }: { children: React.ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {children}
    </SimpleGrid>
  )
}

function CardSkeleton() {
  return (
    <Card padding="md">
      <Stack gap={10}>
        <Skeleton height={16} width="65%" />
        <Skeleton height={12} width="40%" />
        <Stack gap={6} mt={4}>
          <Skeleton height={10} width="85%" />
          <Skeleton height={10} width="55%" />
        </Stack>
      </Stack>
    </Card>
  )
}

export default function SearchResults({
  state,
  query,
  onRetry,
}: SearchResultsProps) {
  if (state.status === 'loading') {
    return (
      <ResultsGrid>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </ResultsGrid>
    )
  }

  if (state.status === 'error') {
    return (
      <StateMessage
        title="Something went wrong"
        description={state.error ?? 'The search could not be completed.'}
        action={
          <Button mt="xs" variant="light" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    )
  }

  if (state.medicines.length === 0) {
    return (
      <StateMessage
        title="No results found"
        description={`We could not find any medicine with the brand name "${query}". Check the spelling or try a different brand.`}
      />
    )
  }

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {state.medicines.length} {state.medicines.length === 1 ? 'result' : 'results'} for "{query}"
      </Text>
      <ResultsGrid>
        {state.medicines.map((medicine: Medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} query={query} />
        ))}
      </ResultsGrid>
    </Stack>
  )
}
