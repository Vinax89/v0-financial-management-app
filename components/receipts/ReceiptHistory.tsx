// components/receipts/ReceiptHistory.tsx
'use client'
import * as React from 'react'

export default function ReceiptHistory({ id, onRevert }: { id: string; onRevert?: ()=>void }) {
  const [rows, setRows] = React.useState<any[]>([])
  const [err, setErr] = React.useState<string | null>(null)

  React.useEffect(() => { (async()=>{
    const r = await fetch(`/api/receipts/${id}/versions`)
    if (!r.ok) { setErr('Failed to load history'); return }
    const j = await r.json(); setRows(j.versions || [])
  })() }, [id])

  async function revert(versionId: string) {
    if (!confirm('Revert to this version?')) return
    const r = await fetch(`/api/receipts/${id}/revert`, { method: 'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ versionId }) })
    if (!r.ok) { alert('Revert failed'); return }
    onRevert?.()
  }

  return (
    <div className="space-y-2 max-h-64 overflow-auto">
      {err && <div className="text-sm text-red-600">{err}</div>}
      {rows.map(v => (
        <div key={v.id} className="border rounded p-2 text-xs">
          <div className="flex items-center justify-between">
            <div>{new Date(v.created_at).toLocaleString()}</div>
            <button className="px-2 py-1 border rounded" onClick={()=>revert(v.id)}>Revert</button>
          </div>
          {v.changed_keys?.length ? (
            <div className="mt-1">Changed: {v.changed_keys.join(', ')}</div>
          ) : <div className="mt-1 opacity-60">(all)</div>}
        </div>
      ))}
    </div>
  )
}
