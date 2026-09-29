import { useEffect, useState } from 'react'

/**
 * Retourne `true` uniquement si `isLoading` reste vrai plus de `delayMs`.
 * Optionnel : `minVisibleMs` garde le loader affiché un minimum de temps une fois apparu,
 * pour éviter un flash à 1,05 s par exemple.
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 1000): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShow(false)
      return undefined
    }

    const timer = setTimeout(() => setShow(true), delayMs)

    return () => clearTimeout(timer)
  }, [isLoading, delayMs])

  return show
}
