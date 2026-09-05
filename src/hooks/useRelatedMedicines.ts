import { useEffect, useState } from 'react'
import { fetchLabelsByUnii } from '../api/client'
import { toMedicines } from '../api/medicine'
import type { Medicine } from '../api/medicine'
import { createLruCache } from '../lib/lruCache'

const RELATED_LIMIT = 4

const cache = createLruCache<Medicine[]>(20)

export function useRelatedMedicines(
  currentId: string | undefined,
  unii: string | undefined,
) {
  const [related, setRelated] = useState<Medicine[]>([])

  useEffect(() => {
    if (!currentId || !unii) {
      setRelated([])
      return
    }

    const cached = cache.get(unii)

    if (cached) {
      setRelated(cached.filter((item) => item.id !== currentId).slice(0, RELATED_LIMIT))
      return
    }

    const controller = new AbortController()

    setRelated([])

    fetchLabelsByUnii(unii, controller.signal)
      .then((labels) => {
        const medicines = toMedicines(labels)

        cache.set(unii, medicines)

        if (controller.signal.aborted) {
          return
        }

        setRelated(
          medicines.filter((item) => item.id !== currentId).slice(0, RELATED_LIMIT),
        )
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRelated([])
        }
      })

    return () => controller.abort()
  }, [currentId, unii])

  return related
}
