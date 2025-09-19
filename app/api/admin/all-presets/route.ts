import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_IDS = ['5273e970-1c32-4416-8e50-4d567104444c']

export async function GET(req: Request) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || !ADMIN_IDS.includes(user.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb.from('filter_presets').select(`*, user:users(email)`).order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const presets = data.map((p: any) => ({ ...p, user_email: p.user.email }))
  return NextResponse.json({ presets })
}
