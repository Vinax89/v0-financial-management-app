// app/dashboard/receipts/gallery/page.tsx
import { getSupabaseServerClient } from '@/lib/supabase/server'
import ReceiptGallery from '@/components/receipts/ReceiptGallery'

export default async function ReceiptsGalleryPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const size = Math.min(50, Math.max(12, parseInt(searchParams.size || '24')))
  const offset = (page - 1) * size

  const { data: rows, error } = await sb
    .from('receipts')
    .select('id,file_name,file_size,mime_type,processing_status,confidence_score,created_at,thumb_path')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + size - 1)
  if (error) throw error

  const { count } = await sb.from('receipts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Receipts</h1>
        <div className="text-sm opacity-70">Total: {count ?? rows?.length ?? 0}</div>
      </div>
      <ReceiptGallery userId={user.id} initialRows={rows || []} page={page} size={size} total={count||0} />
    </div>
  )
}
