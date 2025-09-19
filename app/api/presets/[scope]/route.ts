import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { scope: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb.from('filter_presets').select('id,name,params,updated_at').eq('user_id', user.id).eq('scope', params.scope).order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ presets: data })
}

export async function POST(req: Request, { params }: { params: { scope: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as { name: string; params: any }
  if (!body?.name || !body?.params) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const { data, error } = await sb.from('filter_presets').upsert({ user_id: user.id, scope: params.scope, name: body.name, params: body.params }).select('id,name,params').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ preset: data })
}
