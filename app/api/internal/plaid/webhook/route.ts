// app/api/internal/plaid/webhook/route.ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { verifyPlaidWebhook } from '@/lib/webhooks/plaid-verify'
import { createClient } from '@supabase/supabase-js'
import { plaidService } from '@/lib/plaid-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (process.env.PLAID_WEBHOOKS_ENABLED === 'false') {
      return NextResponse.json({ ok: true, skipped: 'disabled' })
    }
    // Verify
    const verified = await verifyPlaidWebhook(req as any)
    if (!verified) return NextResponse.json({ error: 'invalid webhook' }, { status: 400 })

    // Idempotency: insert hash once
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { error: dupe } = await admin
      .from('webhook_events')
      .insert({ provider: 'plaid', body_sha256: verified.bodyHash })
    if (dupe && dupe.code === '23505') {
      return NextResponse.json({ ok: true, deduped: true })
    }

    // Parse and dispatch
    const body = JSON.parse(verified.body)
    const type = body.webhook_type as string | undefined
    const code = body.webhook_code as string | undefined
    const itemId = body.item_id as string | undefined

    if (type === 'TRANSACTIONS' && itemId) {
      await Sentry.startSpan({ name: 'plaid.sync', attributes: { code } }, async () => {
        await plaidService.syncItemTransactionsByItemId(itemId)
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    Sentry.captureException(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
