import { useCallback, useEffect, useState } from 'react'
import { ApiError, isAbortError, searchMedicines } from '../api/client'
import type { MatchedField } from '../api/client'
import { toMedicines } from '../api/medicine'
import type { Medicine } from '../api/medicine'
import { createLruCache } from '../lib/lruCache'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export type SearchState = {
  status: SearchStatus
  medicines: Medicine[]
  total: number
  matchedOn: MatchedField
  disclaimer: string | null
  error: string | null
}

const IDLE_STATE: SearchState = {
  status: 'idle',
  medicines: [],
  total: 0,
  matchedOn: 'brand',
  disclaimer: null,
  error: null,
}

type CachedSearch = Omit<SearchState, 'status' | 'error'>

const cache = createLruCache<CachedSearch>(30)

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
      setState({ ...cached, status: 'success', error: null })
      return
    }

    const controller = new AbortController()

    setState({ ...IDLE_STATE, status: 'loading' })

    searchMedicines(term, controller.signal)
      .then((outcome) => {
        const result: CachedSearch = {
          medicines: toMedicines(outcome.labels),
          total: outcome.total,
          matchedOn: outcome.matchedOn,
          disclaimer: outcome.disclaimer,
        }

        cache.set(cacheKey(term), result)

        if (controller.signal.aborted) {
          return
        }

        setState({ ...result, status: 'success', error: null })
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) {
          return
        }

        setState({
          ...IDLE_STATE,
          status: 'error',
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
