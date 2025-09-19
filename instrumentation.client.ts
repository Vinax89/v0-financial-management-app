import * as Sentry from '@sentry/nextjs'

let inited = false
export function register() {
  if (inited) return
  inited = true
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  })
}
