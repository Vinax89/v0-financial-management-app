import { getSupabaseServerClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import FilterBar from '@/components/filters/FilterBar'
import { parseFilters } from '@/lib/filters'

const NetCashflowChart = dynamic(() => import('@/components/analytics/NetCashflowChart'), { ssr: false })

export default async function CashflowPage({ searchParams }: { searchParams: Record<string, string|undefined> }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { from, to } = parseFilters(searchParams)
  let q = sb
    .from('v_monthly_net_cashflow_rolling_user')
    .select('month, net_cashflow, net_cashflow_avg_3m')
    .eq('user_id', user.id)
  if (from) q = q.gte('month', from.slice(0,7))
  if (to) q = q.lte('month', to.slice(0,7))
  const { data, error } = await q.order('month')
  if (error) throw error
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Net Cashflow (Rolling 3‑month)</h1>
      <FilterBar init={{ from, to }} />
      <NetCashflowChart rows={(data || []).map((r: any) => ({ ...r, net_cashflow: Number(r.net_cashflow), net_cashflow_avg_3m: Number(r.net_cashflow_avg_3m) }))} />
    </div>
  )
}
