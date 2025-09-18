import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0'),
  sendDefaultPii: false,
  maxBreadcrumbs: 50,
  beforeSend(event, hint) {
    // Strip potentially sensitive fields
    if (event.request) {
      delete event.request.headers; // remove cookies/auth
      if (event.request.data && typeof event.request.data === 'string') {
        // avoid sending raw bodies
        event.request.data = '[redacted]'
      }
    }
    if (event.user) {
      // keep only anonymous id if you set it explicitly elsewhere
      event.user = { id: event.user?.id as any }
    }
    // Attach request id if middleware populated it
    event.tags = { ...event.tags, request_id: event.tags?.request_id || (event as any)._metadata?.request_id }
    return event
  },
})