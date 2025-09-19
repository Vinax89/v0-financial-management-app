export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  } else if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Optional for Next 14 App Router distributed tracing in metadata
// import * as Sentry from '@sentry/nextjs'
// export function generateMetadata() { return { other: { ...Sentry.getTraceData() } } }
