export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://cdn.plaid.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.plaid.com",
    "frame-src 'self' https://cdn.plaid.com https://*.plaid.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

/**
 * ClientStorage: thin wrapper around localStorage/sessionStorage.
 * Do NOT store PII, secrets, or tokens here.
 */
export const ClientStorage = {
  get(key: string, fallback: string | null = null) {
    try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch {}
  },
  remove(key: string) {
    try { localStorage.removeItem(key) } catch {}
  },
}

// Backwards compat: keep deprecated name if referenced
/** @deprecated use ClientStorage */
export const SecureStorage = ClientStorage
