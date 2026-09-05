import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map<string, number>()
const MAX_RESTORE_FRAMES = 12

function pageHeight(): number {
  return document.documentElement.scrollHeight
}

export function useScrollRestoration() {
  const { key } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    let lastHeight = pageHeight()

    const remember = () => {
      const height = pageHeight()

      if (height < lastHeight) {
        lastHeight = height
        return
      }

      lastHeight = height
      positions.set(key, window.scrollY)
    }

    window.addEventListener('scroll', remember, { passive: true })

    return () => window.removeEventListener('scroll', remember)
  }, [key])

  useLayoutEffect(() => {
    const target = navigationType === 'POP' ? (positions.get(key) ?? 0) : 0

    if (target === 0) {
      window.scrollTo(0, 0)
      return
    }

    let frame = 0
    let attempts = 0

    const settle = () => {
      window.scrollTo(0, target)
      attempts += 1

      if (window.scrollY < target && attempts < MAX_RESTORE_FRAMES) {
        frame = requestAnimationFrame(settle)
      }
    }

    settle()

    return () => cancelAnimationFrame(frame)
  }, [key, navigationType])
}
