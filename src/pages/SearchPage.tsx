import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Chip, Group, Stack, Text, Title } from '@mantine/core'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useMedicineSearch } from '../hooks/useMedicineSearch'

const EXAMPLES = ['Advil', 'Tylenol', 'Zyrtec', 'Benadryl']

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [term, setTerm] = useState(() => searchParams.get('q') ?? '')
  const [debouncedTerm, flushSearch] = useDebouncedValue(term, 400)
  const { state, retry } = useMedicineSearch(debouncedTerm)

  useEffect(() => {
    const current = searchParams.get('q') ?? ''

    if (current === debouncedTerm) {
      return
    }

    const next = new URLSearchParams(searchParams)

    if (debouncedTerm.trim()) {
      next.set('q', debouncedTerm)
    } else {
      next.delete('q')
    }

    setSearchParams(next, { replace: true })
  }, [debouncedTerm, searchParams, setSearchParams])

  return (
    <Stack gap="lg">
      <Stack gap={6}>
        <Title order={2}>Search medicines</Title>
        <Text c="dimmed">
          Look up a medicine to see its label information from the FDA.
        </Text>
      </Stack>

      <SearchBar
        value={term}
        busy={state.status === 'loading'}
        onChange={setTerm}
        onSubmit={flushSearch}
      />

      {state.status === 'idle' ? (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Try one of these
          </Text>
          <Group gap="xs">
            {EXAMPLES.map((example) => (
              <Chip
                key={example}
                checked={false}
                variant="outline"
                onClick={() => setTerm(example)}
              >
                {example}
              </Chip>
            ))}
          </Group>
        </Stack>
      ) : (
        <SearchResults
          state={state}
          query={debouncedTerm.trim()}
          onRetry={retry}
        />
      )}
    </Stack>
  )
}
