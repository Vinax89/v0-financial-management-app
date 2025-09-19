import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
  replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0'),
  replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '1'),
  sendDefaultPii: false,
  beforeSend(event) {
    // nuke headers/body, keep minimal URL + method
    if (event.request) {
      event.request.headers = undefined as any
      event.request.data = undefined as any
    }
    if (event.user) event.user = { id: event.user?.id as any }
    return event
  },
  integrations: (integrations) => integrations,
})
