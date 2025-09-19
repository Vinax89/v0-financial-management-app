// lib/jobs/backoff.ts
export function computeBackoffMs(attempts: number, baseMs = 5_000, maxMs = 30 * 60_000) {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, Math.max(0, attempts - 1)))
  const jitter = Math.round(exp * 0.2 * Math.random()) // ±20%
  return Math.min(maxMs, exp - jitter)
}
