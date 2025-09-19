import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { toCSV } from '@/lib/csv'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ALLOWED = new Map<string, { select: string; from: string; name: string }>([
  ['budget-variance', { select: 'user_id,month,category_name,budget_amount,actual_expense,variance', from: 'v_budget_variance_user', name: 'budget_variance' }],
  ['net-cashflow',    { select: 'user_id,month,net_cashflow,net_cashflow_avg_3m', from: 'v_monthly_net_cashflow_rolling_user', name: 'net_cashflow' }],
  ['top-categories',  { select: 'user_id,month,category_name,expense_total', from: 'v_monthly_top_categories_user', name: 'top_categories' }],
  ['recurring',       { select: 'user_id,vendor_key,first_seen,last_seen,tx_count,total_spend,avg_spend', from: 'v_recurring_vendors_user', name: 'recurring_vendors' }],
])

export async function GET(req: Request) {
  const url = new URL(req.url)
  const view = url.searchParams.get('view') || ''
  const month = url.searchParams.get('month') || undefined
  const cfg = ALLOWED.get(view)
  if (!cfg) return NextResponse.json({ error: 'unsupported view' }, { status: 400 })

  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let q = sb.from(cfg.from).select(cfg.select).eq('user_id', user.id)
  if (month && (view === 'budget-variance' || view === 'top-categories')) q = q.eq('month', month)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const csv = toCSV(data as any[])
  const bucket = process.env.CSV_EXPORT_BUCKET!
  const prefix = process.env.CSV_EXPORT_PREFIX || 'exports/'
  const key = `${prefix}${cfg.name}_${user.id}_${Date.now()}${month ? '_' + month : ''}.csv`

  const s3 = new S3Client({ region: process.env.AWS_REGION })
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: csv, ContentType: 'text/csv; charset=utf-8' }))
  const ttl = Number(process.env.CSV_EXPORT_TTL_SECONDS || '900')
  const urlSigned = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: ttl })
  return NextResponse.json({ ok: true, url: urlSigned, key })
}
