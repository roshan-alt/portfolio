export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function authHeaders(): HeadersInit {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

function warnIfMisconfiguredApi() {
  if (typeof window === 'undefined') return
  const onGithub = window.location.hostname.endsWith('github.io')
  const localApi = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')
  if (onGithub && localApi) {
    console.error(
      `[portfolio] VITE_API_URL is "${API_BASE}" but site is on GitHub Pages. Set VITE_API_URL to your Render URL and redeploy.`,
    )
  }
}

warnIfMisconfiguredApi()

export async function parseApiError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const data = JSON.parse(text) as { detail?: string | { msg?: string }[] }
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ')
    }
  } catch {
    /* plain text body */
  }
  return text || res.statusText
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...init?.headers },
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json()
}

export function login(email: string, password: string) {
  return api<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((d) => localStorage.setItem('token', d.access_token))
}
