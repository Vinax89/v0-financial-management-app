import { getSupabaseServerClient } from '@/lib/supabase/server'
import FilterBar from '@/components/filters/FilterBar'
import { parseFilters } from '@/lib/filters'
import PresetBar from '@/components/filters/PresetBar'
import ExportLauncher from '@/components/exports/ExportLauncher'

export default async function TransactionsPage({ searchParams }: { searchParams: Record<string, string|string[]|undefined> }) {
  const { month, from, to, q, categoryIds, amountMin, amountMax, amountMode } = parseFilters(searchParams)
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  let qy = sb.from('v_tx_denorm').select('*').eq('user_id', user.id)
  if (month) qy = qy.eq('month', month)
  if (from) qy = qy.gte('date', from)
  if (to) qy = qy.lte('date', to)
  if (q) qy = qy.or(`name.ilike.%${q}%,merchant_name.ilike.%${q}%`)
  if (categoryIds && categoryIds.length) qy = qy.in('category_id', categoryIds)
  if (amountMode === 'absolute') {
    if (amountMin) qy = qy.gte('abs_amount', Number(amountMin))
    if (amountMax) qy = qy.lte('abs_amount', Number(amountMax))
  } else {
    if (amountMin) qy = qy.gte('amount', Number(amountMin))
    if (amountMax) qy = qy.lte('amount', Number(amountMax))
  }
  const { data, error } = await qy.order('date', { ascending: false }).limit(200)
  if (error) throw error

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <FilterBar init={{ month, from, to, q, categoryIds, amountMin, amountMax, amountMode }} />
      <PresetBar scope="transactions" currentParams={{ month, from, to, q, categoryIds, amountMin, amountMax, amountMode }} />
      <ExportLauncher scope="transactions" params={{ month, from, to, q, categoryIds, amountMin, amountMax, amountMode }} />
      <div>
        <a className="underline" href={`/api/export/csv/s3/transactions?month=${encodeURIComponent(month||'')}&from=${encodeURIComponent(from||'')}&to=${encodeURIComponent(to||'')}`}>Export filtered CSV to S3</a>
      </div>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead><tr><th className="p-2">Date</th><th className="p-2">Name</th><th className="p-2">Merchant</th><th className="p-2 text-right">Amount</th><th className="p-2">Category</th></tr></thead>
          <tbody>
            {(data||[]).map((r:any) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.merchant_name}</td>
                <td className="p-2 text-right">{Number(r.amount).toFixed(2)}</td>
                <td className="p-2">{r.category_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
