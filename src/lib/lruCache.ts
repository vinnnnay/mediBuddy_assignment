export type LruCache<T> = {
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
  has: (key: string) => boolean
}

export function createLruCache<T>(maxEntries: number): LruCache<T> {
  const entries = new Map<string, T>()

  const touch = (key: string, value: T) => {
    entries.delete(key)
    entries.set(key, value)
  }

  return {
    has(key) {
      return entries.has(key)
    },
    get(key) {
      const value = entries.get(key)

      if (value === undefined) {
        return undefined
      }

      touch(key, value)

      return value
    },
    set(key, value) {
      touch(key, value)

      if (entries.size > maxEntries) {
        const oldest = entries.keys().next().value

        if (oldest !== undefined) {
          entries.delete(oldest)
        }
      }
    },
  }
}
