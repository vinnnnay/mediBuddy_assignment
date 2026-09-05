import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { List, Stack, Text, Title } from '@mantine/core'
import SearchBar from '../components/SearchBar'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useMedicineSearch } from '../hooks/useMedicineSearch'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [term, setTerm] = useState(() => searchParams.get('q') ?? '')
  const debouncedTerm = useDebouncedValue(term, 400)
  const { status, medicines, error } = useMedicineSearch(debouncedTerm)

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
          Look up a brand name to see its label information from the FDA.
        </Text>
      </Stack>

      <SearchBar
        value={term}
        busy={status === 'loading'}
        onChange={setTerm}
      />

      {status === 'error' && <Text c="red">{error}</Text>}

      {status === 'success' && medicines.length === 0 && (
        <Text c="dimmed">No results found for "{debouncedTerm}".</Text>
      )}

      {status === 'success' && medicines.length > 0 && (
        <List>
          {medicines.map((medicine) => (
            <List.Item key={medicine.id}>{medicine.brandName}</List.Item>
          ))}
        </List>
      )}
    </Stack>
  )
}
