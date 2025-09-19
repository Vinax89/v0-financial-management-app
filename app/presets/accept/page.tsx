import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function AcceptPresetPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!token) return <div className="p-6">Missing token.</div>
  if (!user) return <div className="p-6">Please sign in to import this preset.</div>
  const { data, error } = await sb.rpc('redeem_preset_share', { p_token: token })
  if (error) return <div className="p-6">Failed to import preset: {error.message}</div>
  return <div className="p-6">Preset imported. <a className="underline" href="/dashboard/analytics/transactions">Go to Transactions</a></div>
}
