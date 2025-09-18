import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const LIMIT = 100 // mirror apiLimiter setting

function uid() { return Math.random().toString(36).slice(2) }

test('rate limiter returns 429 after the configured window', async ({ request }) => {
  const id = uid()
  let lastStatus = 200
  for (let i = 0; i < LIMIT + 5; i++) {
    const res = await request.get(`${BASE}/api/limits/ping?id=${id}`)
    lastStatus = res.status()
    if (lastStatus === 429) break
  }
  expect(lastStatus).toBe(429)
})
