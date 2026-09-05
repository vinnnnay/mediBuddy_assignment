import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchLabelById } from '../api/client'
import { toMedicineDetail } from '../api/medicine'
import type { MedicineDetail } from '../api/medicine'

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

export function useMedicineDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>(LOADING_STATE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) {
      setState({ status: 'missing', medicine: null, error: null })
      return
    }

    let active = true

    setState(LOADING_STATE)

    fetchLabelById(id)
      .then((label) => {
        if (!active) {
          return
        }
        setState({
          status: label ? 'success' : 'missing',
          medicine: label ? toMedicineDetail(label) : null,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (!active) {
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

    return () => {
      active = false
    }
  }, [id, attempt])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
