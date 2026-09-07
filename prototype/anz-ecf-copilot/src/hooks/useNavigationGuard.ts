import { useEffect, useCallback } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Blocks navigation when isDirty is true.
 *
 * - Tab close / refresh: native browser "Leave site?" dialog via beforeunload
 * - In-app navigation (sidebar links, back button): useBlocker intercepts and
 *   returns isBlocked=true so the caller can show a confirmation dialog
 */
export function useNavigationGuard(isDirty: boolean) {
  const blocker = useBlocker(isDirty)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const confirm = useCallback(() => {
    if (blocker.state === 'blocked') blocker.proceed()
  }, [blocker])

  const cancel = useCallback(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  return {
    isBlocked: blocker.state === 'blocked',
    confirm,
    cancel,
  }
}
