import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchLabelById, isAbortError } from '../api/client'
import { toMedicineDetail } from '../api/medicine'
import type { MedicineDetail } from '../api/medicine'
import { createLruCache } from '../lib/lruCache'

export type DetailStatus = 'loading' | 'success' | 'missing' | 'error'

export type DetailState = {
  status: DetailStatus
  medicine: MedicineDetail | null
  disclaimer: string | null
  error: string | null
}

const LOADING_STATE: DetailState = {
  status: 'loading',
  medicine: null,
  disclaimer: null,
  error: null,
}

type CachedDetail = {
  medicine: MedicineDetail | null
  disclaimer: string | null
}

const cache = createLruCache<CachedDetail>(20)

export function useMedicineDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>(LOADING_STATE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) {
      setState({ ...LOADING_STATE, status: 'missing' })
      return
    }

    const cached = cache.get(id)

    if (cached) {
      setState({
        status: cached.medicine ? 'success' : 'missing',
        medicine: cached.medicine,
        disclaimer: cached.disclaimer,
        error: null,
      })
      return
    }

    const controller = new AbortController()

    setState(LOADING_STATE)

    fetchLabelById(id, controller.signal)
      .then((page) => {
        const label = page.labels[0]
        const result: CachedDetail = {
          medicine: label ? toMedicineDetail(label) : null,
          disclaimer: page.disclaimer,
        }

        cache.set(id, result)

        if (controller.signal.aborted) {
          return
        }

        setState({
          status: result.medicine ? 'success' : 'missing',
          medicine: result.medicine,
          disclaimer: result.disclaimer,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) {
          return
        }

        setState({
          ...LOADING_STATE,
          status: 'error',
          error:
            error instanceof ApiError
              ? error.message
              : 'Something went wrong while loading this medicine.',
        })
      })

    return () => controller.abort()
  }, [id, attempt])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
