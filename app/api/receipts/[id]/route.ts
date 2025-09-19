// app/api/receipts/[id]/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb
    .from('receipts')
    .select('id,file_name,mime_type,processing_status,merchant_name,total_amount,transaction_date,confidence_score,created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ receipt: data })
}
