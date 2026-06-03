const BLOCKED = /^(javascript|data|vbscript|file):/i

export function safeHttpUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null
  const raw = url.trim()
  if (BLOCKED.test(raw)) return null
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return raw
  } catch {
    return null
  }
}

export function safeMailto(email: string | undefined | null): string | null {
  if (!email?.trim()) return null
  const trimmed = email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null
  return `mailto:${trimmed}`
}

export function externalRel() {
  return 'noopener noreferrer'
}
