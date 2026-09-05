import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchLabelById, isAbortError } from '../api/client'
import { toMedicineDetail } from '../api/medicine'
import type { MedicineDetail } from '../api/medicine'
import { createLruCache } from '../lib/lruCache'

export type DetailStatus = 'loading' | 'success' | 'missing' | 'error'

export type DetailState = {
  status: DetailStatus
  medicine: MedicineDetail | null
  error: string | null
}

const LOADING_STATE: DetailState = {
  status: 'loading',
  medicine: null,
  error: null,
}

const cache = createLruCache<MedicineDetail | null>(20)

export function useMedicineDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>(LOADING_STATE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) {
      setState({ status: 'missing', medicine: null, error: null })
      return
    }

    if (cache.has(id)) {
      const cached = cache.get(id) ?? null

      setState({
        status: cached ? 'success' : 'missing',
        medicine: cached,
        error: null,
      })
      return
    }

    const controller = new AbortController()

    setState(LOADING_STATE)

    fetchLabelById(id, controller.signal)
      .then((label) => {
        const medicine = label ? toMedicineDetail(label) : null

        cache.set(id, medicine)

        if (controller.signal.aborted) {
          return
        }

        setState({
          status: medicine ? 'success' : 'missing',
          medicine,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) {
          return
        }

        setState({
          status: 'error',
          medicine: null,
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
