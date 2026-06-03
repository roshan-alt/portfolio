/** Join Vite `BASE_URL` (e.g. `/portfolio/`) with a relative path without dropping slashes. */
export function assetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const withSlash = base.endsWith('/') ? base : `${base}/`
  const path = relativePath.replace(/^\//, '')
  return `${withSlash}${path}`
}
