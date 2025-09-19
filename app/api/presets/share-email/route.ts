import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { presetId, email, canEdit } = await req.json()
  if (!presetId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { error } = await sb.rpc('share_preset_to_user', { p_preset_id: presetId, p_grantee_email: email, p_can_edit: !!canEdit })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
