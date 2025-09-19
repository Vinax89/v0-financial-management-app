import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { presetId, expiresAt, maxUses = 1 } = await req.json()
  const { data: p, error: e1 } = await sb.from('filter_presets').select('id,name,params,scope').eq('id', presetId).eq('user_id', user.id).single()
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })
  const { data, error } = await sb.from('filter_preset_shares').insert({ preset_id: p.id, owner_user_id: user.id, name: p.name, params: p.params, expires_at: expiresAt ? new Date(expiresAt).toISOString() : null, max_uses: maxUses }).select('token').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const url = new URL('/presets/accept', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  url.searchParams.set('token', data.token)
  return NextResponse.json({ shareUrl: url.toString() })
}
