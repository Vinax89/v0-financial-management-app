// components/receipts/ReceiptEditorModal.tsx
'use client'
import * as React from 'react'

export default function ReceiptEditorModal({ id, open, onClose, onSaved }: { id: string; open: boolean; onClose: ()=>void; onSaved?: ()=>void }) {
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ merchant_name: '', total_amount: '', transaction_date: '', raw_text: '' })

  React.useEffect(() => { if (!open) return; (async()=>{
    setErr(null)
    const r = await fetch(`/api/receipts/${id}`, { cache: 'no-store' })
    if (!r.ok) { setErr('Failed to load'); return }
    const j = await r.json()
    const d = j.receipt
    setForm({
      merchant_name: d.merchant_name || '',
      total_amount: d.total_amount != null ? String(d.total_amount) : '',
      transaction_date: d.transaction_date || '',
      raw_text: d.raw_text || '',
    })
  })() }, [id, open])

  async function save() {
    setLoading(true); setErr(null)
    const payload: any = {
      merchant_name: form.merchant_name.trim(),
      total_amount: form.total_amount === '' ? null : Number(form.total_amount),
      transaction_date: form.transaction_date || null,
      raw_text: form.raw_text,
    }
    const r = await fetch(`/api/receipts/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (!r.ok) { setErr('Save failed'); return }
    onSaved?.(); onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow border">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-medium">Edit Receipt</div>
          <button className="px-2 py-1" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 space-y-3">
          {err && <div className="text-sm text-red-600">{err}</div>}
          <label className="block text-sm">Merchant
            <input className="mt-1 w-full border rounded p-2" value={form.merchant_name} onChange={e=>setForm(f=>({...f, merchant_name: e.target.value}))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Total Amount
              <input type="number" step="0.01" className="mt-1 w-full border rounded p-2" value={form.total_amount} onChange={e=>setForm(f=>({...f, total_amount: e.target.value}))} />
            </label>
            <label className="block text-sm">Transaction Date (YYYY-MM-DD)
              <input type="date" className="mt-1 w-full border rounded p-2" value={form.transaction_date} onChange={e=>setForm(f=>({...f, transaction_date: e.target.value}))} />
            </label>
          </div>
          <label className="block text-sm">Raw Text
            <textarea rows={6} className="mt-1 w-full border rounded p-2" value={form.raw_text} onChange={e=>setForm(f=>({...f, raw_text: e.target.value}))} />
          </label>
        </div>
        <div className="p-3 border-t flex items-center justify-end gap-2">
          <button className="px-3 py-2 border rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-3 py-2 border rounded" onClick={save} disabled={loading}>Save</button>
        </div>
      </div>
    </div>
  )
}
