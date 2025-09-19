import AdminPageClient from '@/components/admin/AdminPageClient'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// TODO: add to DB
const ADMIN_IDS = ['5273e970-1c32-4416-8e50-4d567104444c']

export default async function AdminPage() {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || !ADMIN_IDS.includes(user.id)) return redirect('/')
  return <AdminPageClient />
}
