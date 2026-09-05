import { useCallback, useEffect, useState } from 'react'
import { ApiError, searchLabelsByBrand } from '../api/client'
import { toMedicines } from '../api/medicine'
import type { Medicine } from '../api/medicine'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export type SearchState = {
  status: SearchStatus
  medicines: Medicine[]
  error: string | null
}

const IDLE_STATE: SearchState = {
  status: 'idle',
  medicines: [],
  error: null,
}

export function useMedicineSearch(query: string) {
  const [state, setState] = useState<SearchState>(IDLE_STATE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const term = query.trim()

    if (!term) {
      setState(IDLE_STATE)
      return
    }

    let active = true

    setState({ status: 'loading', medicines: [], error: null })

    searchLabelsByBrand(term)
      .then((labels) => {
        if (!active) {
          return
        }
        setState({
          status: 'success',
          medicines: toMedicines(labels),
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          medicines: [],
          error:
            error instanceof ApiError
              ? error.message
              : 'Something went wrong while searching. Please try again.',
        })
      })

    return () => {
      active = false
    }
  }, [query, attempt])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
