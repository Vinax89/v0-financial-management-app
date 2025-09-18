'use server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function upsertBudget(input: { categoryId: string; month: string; amount: number }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await sb.from('budgets')
    .upsert({ user_id: user.id, category_id: input.categoryId, month: input.month, amount: input.amount })
    .select('*')
    .single()
  if (error) throw error
  return data
}