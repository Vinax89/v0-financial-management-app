import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { paginate } from '@/lib/export/pager'
import { createCsvStream } from '@/lib/export/csv-stream'
import { uploadStreamToS3 } from '@/lib/export/s3-upload'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const COLS = ['date','name','merchant_name','amount','iso_currency_code','category_name','month','transaction_id','account_id']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const pageSize = Number(url.searchParams.get('pageSize') || '5000')
  const concurrency = Number(url.searchParams.get('concurrency') || '4')
  const month = url.searchParams.get('month') || undefined
  const from = url.searchParams.get('from') || undefined
  const to = url.searchParams.get('to') || undefined
  const csvName = `transactions_${month || 'all'}_${Date.now()}.csv`

  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fetchPage = async (offset: number, limit: number) => {
    let q = sb.from('v_tx_denorm')
      .select(COLS.join(','))
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)
    if (month) q = q.eq('month', month)
    if (from) q = q.gte('date', from)
    if (to) q = q.lte('date', to)
    const { data, error } = await q
    if (error) throw error
    return (data || []) as any[]
  }

  const bucket = process.env.CSV_EXPORT_BUCKET!
  const prefix = process.env.CSV_EXPORT_PREFIX || 'exports/'
  const key = `${prefix}${csvName}`

  const { stream, writeRows, end } = createCsvStream<any>(COLS)
  const uploadPromise = uploadStreamToS3({ bucket, key, body: stream as any, concurrency })

  for await (const rows of paginate(fetchPage, pageSize)) {
    if (!writeRows(rows)) {
      await new Promise(res => (stream as any).once('drain', res))
    }
  }
  end()
  await uploadPromise

  // return presigned GET URL
  const s3 = new S3Client({ region: process.env.AWS_REGION })
  const ttl = Number(process.env.CSV_EXPORT_TTL_SECONDS || '900')
  const presigned = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: ttl })
  return NextResponse.json({ ok: true, url: presigned, key })
}
