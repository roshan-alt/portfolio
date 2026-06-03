import { normalizeContent } from './normalizeContent'
import type { Content } from '../types'

const CACHE_KEY = 'portfolio:public-content:v1'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

type Cached = { at: number; raw: Parameters<typeof normalizeContent>[0] }

export function readContentCache(): Content | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, raw: data } = JSON.parse(raw) as Cached
    if (Date.now() - at > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return normalizeContent(data)
  } catch {
    return null
  }
}

export function writeContentCache(raw: Parameters<typeof normalizeContent>[0]): void {
  try {
    const payload: Cached = { at: Date.now(), raw }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}
