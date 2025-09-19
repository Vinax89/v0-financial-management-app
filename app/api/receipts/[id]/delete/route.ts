// app/api/receipts/[id]/delete/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: r, error } = await sb.from('receipts').select('id,user_id,file_path,thumb_path').eq('id', params.id).single()
  if (error || !r || r.user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const errs: string[] = []
  if (r.file_path) {
    const { error: e } = await sb.storage.from('receipts').remove([r.file_path])
    if (e) errs.push('file')
  }
  if (r.thumb_path) {
    const { error: e } = await sb.storage.from('receipts').remove([r.thumb_path])
    if (e) errs.push('thumb')
  }
  const { error: delErr } = await sb.from('receipts').delete().eq('id', r.id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, storageErrors: errs })
}
