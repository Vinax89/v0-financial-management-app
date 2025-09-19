import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processDeliveries } from '@/lib/notify/webhook'

function safeEqual(a: string, b: string) { if (a.length !== b.length) return false; let o=0; for (let i=0;i<a.length;i++) o|=a.charCodeAt(i)^b.charCodeAt(i); return o===0 }

export async function POST(req: Request) {
  const hdr = req.headers.get('x-cron-secret') || ''
  const secret = process.env.CRON_SECRET || ''
  if (!secret || !safeEqual(secret, hdr)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await processDeliveries(admin, 10)
  return NextResponse.json({ ok: true })
}
