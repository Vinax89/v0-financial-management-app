import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { notifyJobEmail } from '@/lib/notify/email'
import { enqueueDeliveries } from '@/lib/notify/webhook'

function safeEqual(a: string, b: string) { if (a.length !== b.length) return false; let o=0; for (let i=0;i<a.length;i++) o|=a.charCodeAt(i)^b.charCodeAt(i); return o===0 }

export async function POST(req: Request) {
  const hdr = req.headers.get('x-cron-secret') || ''
  const secret = process.env.CRON_SECRET || ''
  if (!secret || !safeEqual(secret, hdr)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: jobs, error } = await admin
    .from('export_jobs')
    .select('id,user_id,params,created_at,attempts,max_attempts')
    .in('status', ['queued','processing'])
    .or('next_attempt_at.is.null,next_attempt_at.lte.' + new Date().toISOString())
    .order('created_at')
    .limit(5)

  if (error) throw error

  for (const job of jobs || []) {
    await admin.from('export_jobs').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', job.id)
    try {
      // Generate CSV
      const { data, error } = await admin.from('v_tx_denorm').select('*').eq('user_id', job.user_id) // Add filtering based on job.params
      if (error) throw error
      const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n')

      // Upload to S3
      const s3 = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } })
      const key = `exports/${job.user_id}/${job.id}.csv`
      await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: csv }))

      // Generate signed URL
      const urlSigned = await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }), { expiresIn: 3600 })

      await admin.from('export_jobs').update({ status: 'done', finished_at: new Date().toISOString(), result_url: urlSigned }).eq('id', job.id)
      // Email
      const { data: userRow } = await admin.rpc('auth_get_user_by_id', { uid: job.user_id }).single().catch(()=>({ data: null }))
      if (userRow?.email) await notifyJobEmail(userRow.email, { id: job.id, status: 'done' })
      // Webhooks
      await enqueueDeliveries(admin, job.user_id, 'job.done', { job_id: job.id, url: urlSigned })
    } catch (e: any) {
      const attempts = (job.attempts || 0) + 1
      if (attempts >= (job.max_attempts || 5)) {
        await admin
          .from('export_jobs')
          .update({ status: 'error', dead_letter: true, finished_at: new Date().toISOString(), attempts, error: String(e?.message || e) })
          .eq('id', job.id)
        const { data: userRow } = await admin.rpc('auth_get_user_by_id', { uid: job.user_id }).single().catch(()=>({ data: null }))
        if (userRow?.email) await notifyJobEmail(userRow.email, { id: job.id, status: 'error', error: String(e?.message || e) })
        await enqueueDeliveries(admin, job.user_id, 'job.error', { job_id: job.id, error: String(e?.message || e) })
      } else {
        const { computeBackoffMs } = await import('@/lib/jobs/backoff')
        const delay = computeBackoffMs(attempts)
        const next = new Date(Date.now() + delay).toISOString()
        await admin
          .from('export_jobs')
          .update({ status: 'queued', attempts, next_attempt_at: next, error: String(e?.message || e) })
          .eq('id', job.id)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
