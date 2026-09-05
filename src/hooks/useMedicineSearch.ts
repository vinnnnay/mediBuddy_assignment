import { useCallback, useEffect, useState } from 'react'
import { ApiError, isAbortError, searchLabelsByBrand } from '../api/client'
import { toMedicines } from '../api/medicine'
import type { Medicine } from '../api/medicine'
import { createLruCache } from '../lib/lruCache'

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

const cache = createLruCache<Medicine[]>(30)

function cacheKey(term: string): string {
  return term.toLowerCase()
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

    const cached = cache.get(cacheKey(term))

    if (cached) {
      setState({ status: 'success', medicines: cached, error: null })
      return
    }

    const controller = new AbortController()

    setState({ status: 'loading', medicines: [], error: null })

    searchLabelsByBrand(term, controller.signal)
      .then((labels) => {
        const medicines = toMedicines(labels)

        cache.set(cacheKey(term), medicines)

        if (controller.signal.aborted) {
          return
        }

        setState({ status: 'success', medicines, error: null })
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) {
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

    return () => controller.abort()
  }, [query, attempt])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
