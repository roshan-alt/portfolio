import { useEffect, useState } from 'react'
import { api, API_BASE } from '../api'
import { readContentCache, writeContentCache } from '../lib/contentCache'
import { normalizeContent } from '../lib/normalizeContent'
import type { Content } from '../types'

function friendlyFetchError(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Network error — API unreachable or blocked by CORS. Check Render URL and APP_ORIGINS.'
  }
  return err instanceof Error ? err.message : String(err)
}

/** Wake Render free tier without blocking UI. */
function pingApiHealth(): void {
  fetch(`${API_BASE}/health`, { mode: 'cors' }).catch(() => {})
}

export function useContent() {
  const cached = readContentCache()
  const [data, setData] = useState<Content | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)
  const [slow, setSlow] = useState(false)
  const [refreshing, setRefreshing] = useState(!!cached)

  useEffect(() => {
    pingApiHealth()

    const slowTimer = window.setTimeout(() => setSlow(true), 4000)

    api<Content>('/public/content')
      .then((raw) => {
        writeContentCache(raw)
        setData(normalizeContent(raw))
        setError(null)
      })
      .catch((e) => {
        if (!data) setError(friendlyFetchError(e))
      })
      .finally(() => {
        window.clearTimeout(slowTimer)
        setLoading(false)
        setRefreshing(false)
        setSlow(false)
      })

    return () => window.clearTimeout(slowTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once; stale `data` only gates error display
  }, [])

  return { data, loading, error, slow, refreshing }
}
