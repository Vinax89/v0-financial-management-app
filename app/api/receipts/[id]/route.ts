// app/api/receipts/[id]/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb
    .from('receipts')
    .select('id,file_name,mime_type,processing_status,merchant_name,total_amount,transaction_date,confidence_score,created_at,raw_text')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ receipt: data })
}

const ReceiptUpdate = z.object({
  merchant_name: z.string().trim().max(256).optional(),
  total_amount: z.number().min(0).max(1_000_000).nullable().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  raw_text: z.string().max(20000).optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(()=>null)
  const parsed = ReceiptUpdate.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Bad payload' }, { status: 400 })

  const { data, error } = await sb
    .from('receipts')
    .update(parsed.data)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('id,merchant_name,total_amount,transaction_date,raw_text,confidence_score,processing_status,updated_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ receipt: data })
}
