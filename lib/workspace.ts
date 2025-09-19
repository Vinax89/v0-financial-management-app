import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getActiveWorkspace() {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: me } = await sb.from('user_profiles').select('active_workspace_id').eq('id', user.id).single()
  if (me?.active_workspace_id) return me.active_workspace_id as string
  // fallback to first workspace; if none, create one
  const { data: wss } = await sb.from('v_my_workspaces').select('id').limit(1)
  if (wss && wss.length) return wss[0].id as string
  const name = 'My Workspace'
  const { data: ws, error } = await sb.from('workspaces').insert({ name, owner_user_id: user.id }).select('id').single()
  if (error) throw error
  await sb.from('workspace_members').insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' as any })
  await sb.from('user_profiles').update({ active_workspace_id: ws.id }).eq('id', user.id)
  return ws.id as string
}

export async function setActiveWorkspace(workspaceId: string) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return false
  // ensure membership
  const { data: isMember } = await sb.from('v_my_workspaces').select('id').eq('id', workspaceId).limit(1)
  if (!isMember || !isMember.length) return false
  await sb.from('user_profiles').update({ active_workspace_id: workspaceId }).eq('id', user.id)
  return true
}
