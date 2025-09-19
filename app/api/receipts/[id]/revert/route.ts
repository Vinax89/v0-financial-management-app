// app/api/receipts/[id]/revert/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { versionId } = await req.json()
  if (!versionId) return NextResponse.json({ error: 'versionId required' }, { status: 400 })
  const { data: v, error: e1 } = await sb
    .from('receipt_versions').select('before, after, created_at').eq('id', versionId).single()
  if (e1 || !v) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  const patch = v.after as any // revert to what the row was *after* that version
  const { data, error } = await sb
    .from('receipts')
    .update({
      merchant_name: patch.merchant_name,
      total_amount: patch.total_amount,
      transaction_date: patch.transaction_date,
      raw_text: patch.raw_text,
      confidence_score: patch.confidence_score,
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('id,merchant_name,total_amount,transaction_date,raw_text,confidence_score,updated_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ receipt: data })
}
