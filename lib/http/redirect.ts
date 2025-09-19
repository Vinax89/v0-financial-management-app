const ALLOWED_HOSTS = new Set<string>([
  'localhost',
  '127.0.0.1',
  process.env.NEXT_PUBLIC_SITE_HOST?.toLowerCase() || '', // e.g. app.yourdomain.com
].filter(Boolean))

export function safeRedirect(input: string | URL, fallbackPath = '/') {
  const url = new URL(input, 'http://dummy')
  // only allow same-host relative paths like "/dashboard" or "/settings"
  if (!url.host && input.toString().startsWith('/')) return input.toString()
  // otherwise require allowlisted host & https
  if (ALLOWED_HOSTS.has(url.hostname.toLowerCase()) && (url.protocol === 'https:' || url.hostname === 'localhost')) {
    return url.toString()
  }
  return fallbackPath
}
