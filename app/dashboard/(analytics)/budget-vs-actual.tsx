// app/dashboard/(analytics)/budget-vs-actual.tsx
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function BudgetVsActualTable({ month }: { month: string }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data, error } = await sb
    .from('v_monthly_budget_vs_actual_live')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .order('category_name')
  if (error) throw error
  return (
    <table className="min-w-full text-sm">
      <thead><tr><th>Category</th><th className="text-right">Budget</th><th className="text-right">Actual</th></tr></thead>
      <tbody>
        {data?.map(r => (
          <tr key={r.category_id || r.category_name}>
            <td>{r.category_name || 'Uncategorized'}</td>
            <td className="text-right">{Number(r.budget_amount).toFixed(2)}</td>
            <td className="text-right">{Number(r.actual_expense).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
