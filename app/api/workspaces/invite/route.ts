import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getActiveWorkspace } from '@/lib/workspace'

export async function POST(req: Request) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email, role } = await req.json()
  const ws = await getActiveWorkspace()
  if (!ws) return NextResponse.json({ error: 'No workspace' }, { status: 400 })
  const { error } = await sb.rpc('workspace_invite_by_email', { p_workspace: ws, p_email: email, p_role: role || 'member' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
