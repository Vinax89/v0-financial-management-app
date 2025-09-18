import { NextResponse } from 'next/server'
import { apiLimiter } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const probe = url.searchParams.has('probe')
  const custom = url.searchParams.get('id') || ''
  const fwd = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  const ip = fwd || '127.0.0.1'
  const key = `${ip}:${custom}`
  const { success, limit, remaining, reset } = probe ? await apiLimiter.peek(key) : await apiLimiter.limit(key)
  return new NextResponse(
    JSON.stringify({ ok: success, limit, remaining, reset }),
    { status: success ? 200 : 429, headers: { 'content-type': 'application/json' } }
  )
}
