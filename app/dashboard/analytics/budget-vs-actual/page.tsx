import { getSupabaseServerClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/format'
import FilterBar from '@/components/filters/FilterBar'
import { parseFilters } from '@/lib/filters'

export default async function BudgetVsActualPage({ searchParams }: { searchParams: Record<string, string|string[]|undefined> }) {
  const { month = new Date().toISOString().slice(0,7), categoryIds } = parseFilters(searchParams)
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  let q = sb.from('v_budget_variance_user')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
  if (categoryIds && categoryIds.length) q = q.in('category_id', categoryIds)
  const { data, error } = await q.order('category_name')
  if (error) throw error

  const totalBudget = data?.reduce((s, r: any) => s + Number(r.budget_amount||0), 0) ?? 0
  const totalActual = data?.reduce((s, r: any) => s + Number(r.actual_expense||0), 0) ?? 0
  const totalVar = totalActual - totalBudget

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Budget vs Actual — {month}</h1>
      <FilterBar init={{ month, categoryIds }} categories={[]} />
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-right">Budget</th>
              <th className="p-2 text-right">Actual</th>
              <th className="p-2 text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r: any) => (
              <tr key={r.category_id || r.category_name} className="border-t">
                <td className="p-2">{r.category_name}</td>
                <td className="p-2 text-right">{fmtCurrency(Number(r.budget_amount||0))}</td>
                <td className="p-2 text-right">{fmtCurrency(Number(r.actual_expense||0))}</td>
                <td className={`p-2 text-right ${Number(r.variance) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(Number(r.variance||0))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td className="p-2 text-right">Totals</td>
              <td className="p-2 text-right">{fmtCurrency(totalBudget)}</td>
              <td className="p-2 text-right">{fmtCurrency(totalActual)}</td>
              <td className={`p-2 text-right ${totalVar > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{fmtCurrency(totalVar)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
