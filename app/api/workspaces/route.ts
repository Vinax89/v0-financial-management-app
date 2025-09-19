import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('v_my_workspaces').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ workspaces: data })
}

export async function POST(req: Request) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  const { data, error } = await sb.from('workspaces').insert({ name, owner_user_id: user.id }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await sb.from('workspace_members').insert({ workspace_id: data.id, user_id: user.id, role: 'owner' as any })
  await sb.from('user_profiles').update({ active_workspace_id: data.id }).eq('id', user.id)
  return NextResponse.json({ id: data.id })
}
