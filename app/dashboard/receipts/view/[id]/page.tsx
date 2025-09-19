// app/dashboard/receipts/view/[id]/page.tsx
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function ReceiptViewPage({ params }: { params: { id: string } }) {
  const sb = await getSupabaseServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data, error } = await sb
    .from('receipts')
    .select('id,file_name,mime_type,processing_status,merchant_name,total_amount,transaction_date,confidence_score,created_at,raw_text')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  if (error) throw error
  const signed = await fetch(`/api/receipts/${params.id}/signed-url`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>({})) as any

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{data.file_name}</h1>
      {signed?.file && data.mime_type.startsWith('image/') && (
        <img src={signed.file} alt={data.file_name} className="max-w-full rounded border" />
      )}
      {signed?.file && data.mime_type === 'application/pdf' && (
        <iframe src={signed.file} className="w-full h-[70vh] border rounded" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Metadata</div>
          <div className="text-sm space-y-1">
            <div>Status: {data.processing_status}</div>
            <div>Confidence: {typeof data.confidence_score==='number' ? (data.confidence_score*100).toFixed(0)+'%' : '—'}</div>
            <div>Merchant: {data.merchant_name || '—'}</div>
            <div>Total: {data.total_amount ?? '—'}</div>
            <div>Date: {data.transaction_date || '—'}</div>
            <div>Uploaded: {new Date(data.created_at).toLocaleString()}</div>
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Raw Text</div>
          <pre className="text-xs whitespace-pre-wrap">{data.raw_text || '—'}</pre>
        </div>
      </div>
    </div>
  )
}
