import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: { scope: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as { params: any }
  if (!body?.params) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const { data, error } = await sb.from('export_jobs').insert({ user_id: user.id, scope: params.scope, params: body.params }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job: data })
}
