// app/api/receipts/[id]/signed-url/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: r, error } = await sb.from('receipts').select('file_path, thumb_path, user_id').eq('id', params.id).single()
  if (error || !r || r.user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const ttl = 60 * 10
  const res: Record<string,string|null> = { file: null, thumb: null }
  if (r.file_path) res.file = (await sb.storage.from('receipts').createSignedUrl(r.file_path, ttl)).data?.signedUrl || null
  if (r.thumb_path) res.thumb = (await sb.storage.from('receipts').createSignedUrl(r.thumb_path, ttl)).data?.signedUrl || null
  return NextResponse.json(res)
}
