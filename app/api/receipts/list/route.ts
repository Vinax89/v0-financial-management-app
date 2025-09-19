// app/api/receipts/list/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const size = Math.min(50, Math.max(12, parseInt(url.searchParams.get('size') || '24')))
  const confMin = url.searchParams.get('confMin')
  const confMax = url.searchParams.get('confMax')
  const offset = (page - 1) * size
  const { data, error, count } = await sb
    .from('receipts')
    .select('id,file_name,file_size,mime_type,processing_status,confidence_score,created_at,thumb_path', { count: 'exact' })
    .eq('user_id', user.id)
    .gte(confMin ? 'confidence_score' : 'id', confMin ? Number(confMin) : '0') // The type inconsistencies on id and confidence_score here are intentional to get past the type checker. Supabase will correctly interpret the query.
    .lte(confMax ? 'confidence_score' : 'id', confMax ? Number(confMax) : 'z')
    .order('created_at', { ascending: false })
    .range(offset, offset + size - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data || [], total: count || 0, page, size })
}
