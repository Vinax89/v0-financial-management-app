// app/api/internal/cron/process-receipts/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeBackoffMs } from '@/lib/jobs/backoff'
import { processReceiptWithAI } from "@/lib/ocr-service"
import sharp from 'sharp'
import { createHmac } from 'crypto'

function safeEqual(a: string, b: string) { if (a.length !== b.length) return false; let o=0; for (let i=0;i<a.length;i++) o|=a.charCodeAt(i)^b.charCodeAt(i); return o===0 }

export const runtime = 'nodejs'
export async function POST(req: Request) {
  const hdr = req.headers.get('x-cron-secret') || ''
  const secret = process.env.CRON_SECRET || ''
  if (!secret || !safeEqual(secret, hdr)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: jobs, error } = await admin
    .from('receipt_ocr_jobs')
    .select('id, receipt_id, user_id, attempts')
    .in('status', ['queued','processing'])
    .or('next_attempt_at.is.null,next_attempt_at.lte.' + new Date().toISOString())
    .order('created_at')
    .limit(5)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let processed = 0
  for (const job of jobs || []) {
    processed++
    await admin.from('receipt_ocr_jobs').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', job.id)

    try {
      // Load receipt row
      const { data: r } = await admin.from('receipts').select('id,user_id,mime_type,file_path').eq('id', job.receipt_id).single()
      if (!r?.file_path) throw new Error('missing file_path')

      // Download source file via signed URL
      const { data: signed, error: signErr } = await admin.storage.from('receipts').createSignedUrl(r.file_path, 60)
      if (signErr) throw signErr
      const res = await fetch(signed.signedUrl)
      if (!res.ok) throw new Error('failed to fetch source file')
      const buf = Buffer.from(await res.arrayBuffer())

      // OCR via your existing service
      const base64 = buf.toString('base64')
      const receiptData = await processReceiptWithAI(base64, r.mime_type)

      // Thumbnail (images locally, PDFs via external service)
      let thumbPath: string | null = null
      if (r.mime_type.startsWith('image/')) {
        const image = sharp(buf).rotate().resize({ width: 640, withoutEnlargement: true }).jpeg({ quality: 70 })
        const out = await image.toBuffer()
        const name = r.file_path.replace(/\/([^/]+)$/,'/thumb_$1').replace(/\.[a-zA-Z0-9]+$/, '.jpg')
        const { error: upErr } = await admin.storage.from('receipts').upload(name, out, { contentType: 'image/jpeg', upsert: true })
        if (upErr) throw upErr
        thumbPath = name
      } else if (r.mime_type === 'application/pdf') {
        const endpoint = process.env.PDF_THUMBNAIL_ENDPOINT
        const secret = process.env.PDF_THUMBNAIL_SECRET || ''
        if (endpoint && secret) {
          const payload = JSON.stringify({ url: signed.signedUrl, width: 640 })
          const sig = createHmac('sha256', secret).update(payload).digest('hex')
          const resp = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', 'x-signature': sig }, body: payload })
          if (!resp.ok) throw new Error('thumbnail service failed')
          const { jpegBase64 } = await resp.json() as { jpegBase64: string }
          const out = Buffer.from(jpegBase64, 'base64')
          const name = r.file_path.replace(/\/([^/]+)$/,'/thumb_$1').replace(/\.[a-zA-Z0-9]+$/, '.jpg')
          const { error: upErr } = await admin.storage.from('receipts').upload(name, out, { contentType: 'image/jpeg', upsert: true })
          if (upErr) throw upErr
          thumbPath = name
        }
      }

      // Persist results
      const { error: up } = await admin.from('receipts').update({
        merchant_name: receiptData.merchantName || null,
        total_amount: receiptData.totalAmount ?? null,
        transaction_date: receiptData.date || null,
        items: receiptData.items || [],
        raw_text: receiptData.rawText || '',
        confidence_score: typeof receiptData.confidence === 'number' ? receiptData.confidence : null,
        processing_status: 'completed',
        ocr_error: null,
        ocr_attempts: (job.attempts || 0) + 1,
        ocr_started_at: new Date().toISOString(),
        ocr_finished_at: new Date().toISOString(),
        thumb_path: thumbPath,
      }).eq('id', job.receipt_id)
      if (up) throw up

      await admin.from('receipt_ocr_jobs').update({ status: 'done', finished_at: new Date().toISOString(), attempts: (job.attempts||0)+1 }).eq('id', job.id)
    } catch (e: any) {
      const attempts = (job.attempts || 0) + 1
      if (attempts >= 5) {
        await admin.from('receipt_ocr_jobs').update({ status: 'error', finished_at: new Date().toISOString(), attempts, error: String(e?.message||e) }).eq('id', job.id)
        await admin.from('receipts').update({ processing_status: 'failed', ocr_error: String(e?.message||e), ocr_attempts: attempts }).eq('id', job.receipt_id)
      } else {
        const delay = computeBackoffMs(attempts)
        const next = new Date(Date.now()+delay).toISOString()
        await admin.from('receipt_ocr_jobs').update({ status: 'queued', attempts, next_attempt_at: next, error: String(e?.message||e) }).eq('id', job.id)
        await admin.from('receipts').update({ processing_status: 'uploaded', ocr_error: String(e?.message||e), ocr_attempts: attempts }).eq('id', job.receipt_id)
      }
    }
  }
  return NextResponse.json({ ok: true, processed })
}
