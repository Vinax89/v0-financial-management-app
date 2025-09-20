// instrumentation.ts
import * as Sentry from '@sentry/nextjs'

let inited = false
export function register() {
  if (inited) return
  inited = true
  // Avoid initializing on the Edge unless you intend to
  if (process.env.NEXT_RUNTIME === 'edge') return
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}
