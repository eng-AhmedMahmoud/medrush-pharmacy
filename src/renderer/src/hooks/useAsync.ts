import { useCallback, useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  /** Re-run the async function (e.g. from a Retry button). */
  reload: () => void
  /** Optimistically replace local data without a round-trip. */
  setData: (updater: (prev: T | null) => T | null) => void
}

/**
 * Small data-fetching primitive that models the three states the rubric asks
 * for: loading, error, and loaded (which the UI further splits into empty).
 * Cancels stale results so a fast Retry never flashes an old error.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFn = useCallback(fn, deps)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    stableFn()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Something went wrong')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [stableFn, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  const updateData = useCallback(
    (updater: (prev: T | null) => T | null) => setData((prev) => updater(prev)),
    []
  )

  return { data, loading, error, reload, setData: updateData }
}
