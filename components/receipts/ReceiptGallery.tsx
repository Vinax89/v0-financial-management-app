// components/receipts/ReceiptGallery.tsx
'use client'
import * as React from 'react'
import ConfidenceHeatmap from '@/components/receipts/ConfidenceHeatmap'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import ReceiptEditorModal from '@/components/receipts/ReceiptEditorModal'

type Row = {
  id: string
  file_name: string
  file_size: number | null
  mime_type: string
  processing_status: 'uploaded'|'processing'|'completed'|'failed'
  confidence_score: number | null
  created_at: string
  thumb_path: string | null
}

export default function ReceiptGallery({ userId, initialRows, page, size, total }: { userId: string; initialRows: Row[]; page: number; size: number; total: number }) {
  const [rows, setRows] = React.useState<Row[]>(initialRows)
  const [thumbs, setThumbs] = React.useState<Record<string, string | null>>({})
  const [loading, setLoading] = React.useState(false)
  const [conf, setConf] = React.useState<{ min?: number; max?: number }>({})
  const [editingId, setEditingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const sb = getSupabaseBrowserClient()
    const chan = sb.channel('receipts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts', filter: `user_id=eq.${userId}` }, async (_payload) => {
        // Refresh current page when anything changes for this user
        setLoading(true)
        try {
          const url = new URL(`/api/receipts/list`, location.origin)
          url.searchParams.set('page', String(page))
          url.searchParams.set('size', String(size))
          if (conf.min != null) url.searchParams.set('confMin', String(conf.min))
          if (conf.max != null) url.searchParams.set('confMax', String(conf.max))
          const res = await fetch(url.toString(), { cache: 'no-store' })
          if (res.ok) { const j = await res.json(); setRows(j.rows) }
        } finally { setLoading(false) }
      })
      .subscribe()
    return () => { sb.removeChannel(chan) }
  }, [userId, page, size, conf.min, conf.max])

  // On mount & when rows change, resolve signed thumbnail URLs
  React.useEffect(() => {
    (async () => {
      const out: Record<string, string | null> = {}
      await Promise.all(rows.map(async (r) => {
        try {
          const res = await fetch(`/api/receipts/${r.id}/signed-url`, { cache: 'no-store' })
          if (res.ok) {
            const j = await res.json()
            out[r.id] = j.thumb || null
          }
        } catch {}
      }))
      setThumbs(out)
    })()
  }, [rows])

  function statusBadge(s: Row['processing_status']) {
    const cls = s === 'completed' ? 'bg-emerald-100 border-emerald-300' : s === 'failed' ? 'bg-red-100 border-red-300' : 'bg-amber-50 border-amber-300'
    return <span className={`text-[11px] px-2 py-0.5 rounded border ${cls}`}>{s}</span>
  }

  const pages = Math.max(1, Math.ceil(total / size))

  return (
    <div className="space-y-4">
      <ConfidenceHeatmap rows={rows} onSelect={(min, max) => setConf({ min, max })} onClear={()=>setConf({})} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {rows.map((r) => (
          <div key={r.id} className="group border rounded-lg overflow-hidden hover:shadow">
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
              {thumbs[r.id] ? (
                <img src={thumbs[r.id]!} alt={r.file_name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs opacity-60">{r.mime_type.includes('pdf') ? 'PDF' : 'Image'}</div>
              )}
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm" title={r.file_name}>{r.file_name}</div>
                {statusBadge(r.processing_status)}
              </div>
              <div className="text-[11px] opacity-70">{new Date(r.created_at).toLocaleString()}</div>
              {typeof r.confidence_score === 'number' && (
                <div className="text-[11px]">Conf: {(r.confidence_score * 100).toFixed(0)}%</div>
              )}
              <div className="pt-1 flex items-center gap-2">
                <a className="px-2 py-1 border rounded text-xs" href={`/dashboard/receipts/view/${r.id}`}>Open</a>
                <button className="px-2 py-1 border rounded text-xs" onClick={()=>setEditingId(r.id)}>Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Page {page}/{pages}</div>
        <div className="flex items-center gap-2">
          {page>1 && <a className="px-2 py-1 border rounded" href={`?page=${page-1}&size=${size}`}>Prev</a>}
          {page<pages && <a className="px-2 py-1 border rounded" href={`?page=${page+1}&size=${size}`}>Next</a>}
        </div>
      </div>
      <ReceiptEditorModal id={editingId||''} open={!!editingId} onClose={()=>setEditingId(null)} onSaved={()=>{/* no-op; realtime will refresh */}} />
    </div>
  )
}
