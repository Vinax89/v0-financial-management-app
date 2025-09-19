import { getSupabaseServerClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/format'
import FilterBar from '@/components/filters/FilterBar'
import { parseFilters } from '@/lib/filters'

export default async function TopCategoriesPage({ searchParams }: { searchParams: Record<string, string|undefined> }) {
  const { month = new Date().toISOString().slice(0,7) } = parseFilters(searchParams)
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  const { data, error } = await sb
    .from('v_monthly_top_categories_user')
    .select('category_id, category_name, expense_total')
    .eq('user_id', user.id)
    .eq('month', month)
    .order('expense_total', { ascending: false })
  if (error) throw error

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Top Categories — {month}</h1>
      <FilterBar init={{ month }} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((r: any) => (
          <div key={r.category_id || r.category_name} className="border rounded p-4">
            <div className="text-sm opacity-70">{r.category_name || 'Uncategorized'}</div>
            <div className="text-2xl font-semibold">{fmtCurrency(Number(r.expense_total||0))}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
