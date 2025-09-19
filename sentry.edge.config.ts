import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
  tracePropagationTargets: [
    /.*\.supabase\.co/i,
    /.*\.plaid\.com/i,
    /localhost:3000/i,
  ],
})
