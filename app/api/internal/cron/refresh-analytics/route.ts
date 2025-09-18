// app/api/internal/cron/refresh-analytics/route.ts
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET || ''
  const hdr = req.headers.get('x-cron-secret') || ''
  if (!secret || !safeEqual(secret, hdr)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return await Sentry.startSpan({ name: 'cron.refresh-analytics' }, async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const sb = createClient(url, key)
    const { error } = await sb.rpc('refresh_mv_monthly_category_totals')
    if (error) {
      Sentry.captureException(error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  })
}
