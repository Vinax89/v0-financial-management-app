// lib/notify/webhook.ts
import { createHmac } from 'node:crypto'
import { computeBackoffMs } from '@/lib/jobs/backoff'

function sign(secret: string, body: string) {
  const mac = createHmac('sha256', secret)
  mac.update(body)
  return 'sha256=' + mac.digest('hex')
}

export async function enqueueDeliveries(sbAdmin: any, userId: string, event: string, payload: any) {
  const { data: eps, error } = await sbAdmin
    .from('webhook_endpoints')
    .select('id, url, secret, active, events')
    .eq('user_id', userId)
    .eq('active', true)
  if (error) throw error
  const rows = (eps || []).filter((e: any) => e.events?.includes(event)).map((e: any) => ({
    endpoint_id: e.id, user_id: userId, event, payload
  }))
  if (rows.length) await sbAdmin.from('webhook_deliveries').insert(rows)
}

export async function processDeliveries(sbAdmin: any, limit = 10) {
  const { data: ds, error } = await sbAdmin
    .from('webhook_deliveries')
    .select('id, endpoint_id, user_id, event, payload, attempts')
    .eq('status','queued')
    .or('next_attempt_at.is.null,next_attempt_at.lte.' + new Date().toISOString())
    .order('created_at')
    .limit(limit)
  if (error) throw error
  for (const d of ds || []) {
    await sbAdmin.from('webhook_deliveries').update({ status: 'sending' }).eq('id', d.id)
    const { data: ep } = await sbAdmin.from('webhook_endpoints').select('url,secret').eq('id', d.endpoint_id).single()
    const body = JSON.stringify({ event: d.event, payload: d.payload })
    const sig = sign(ep.secret || process.env.WEBHOOK_DEFAULT_SECRET || 'secret', body)
    let ok = false, status = 0, err: any = null
    try {
      const res = await fetch(ep.url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-signature': sig }, body })
      ok = res.ok; status = res.status
    } catch (e) { err = e }
    if (ok) {
      await sbAdmin.from('webhook_deliveries').update({ status: 'ok', response_status: status }).eq('id', d.id)
    } else {
      const attempts = (d.attempts || 0) + 1
      if (attempts >= 8) {
        await sbAdmin.from('webhook_deliveries').update({ status: 'dead', attempts, error: String(err?.message || status) }).eq('id', d.id)
      } else {
        const delay = computeBackoffMs(attempts, 5_000, 60 * 60_000)
        const next = new Date(Date.now() + delay).toISOString()
        await sbAdmin.from('webhook_deliveries').update({ status: 'queued', attempts, next_attempt_at: next, response_status: status, error: String(err?.message || status) }).eq('id', d.id)
      }
    }
  }
}
