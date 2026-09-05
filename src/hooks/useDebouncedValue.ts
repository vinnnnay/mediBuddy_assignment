import { useCallback, useEffect, useRef, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  const latest = useRef(value)

  latest.current = value

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)

    return () => window.clearTimeout(timer)
  }, [value, delay])

  const flush = useCallback(() => {
    setDebounced(latest.current)
  }, [])

  return [debounced, flush] as const
}
