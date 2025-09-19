// components/receipts/ReceiptEditorModal.tsx
'use client'
import * as React from 'react'
import { usePresence } from '@/lib/realtime/usePresence'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import ReceiptHistory from '@/components/receipts/ReceiptHistory'

export default function ReceiptEditorModal({ id, open, onClose, onSaved }: { id: string; open: boolean; onClose: ()=>void; onSaved?: (patch: any) => void }) {
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ merchant_name: '', total_amount: '', transaction_date: '', raw_text: '' })
  const [version, setVersion] = React.useState<string>('') // updated_at for concurrency
  const [me, setMe] = React.useState<any>(null)

  // Load current user identity for presence payload
  React.useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowserClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) setMe({ id: user.id, name: user.user_metadata?.full_name || 'User', email: user.email })
    })()
  }, [])

  const peers = usePresence(id ? `presence:receipts:${id}` : '', me)

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
    setVersion(d.updated_at || '')
  })() }, [id, open])

  async function save() {
    setLoading(true); setErr(null)
    const payload: any = {
      merchant_name: form.merchant_name.trim(),
      total_amount: form.total_amount === '' ? null : Number(form.total_amount),
      transaction_date: form.transaction_date || null,
      raw_text: form.raw_text,
      ifVersion: version,
    }
    // Optimistic apply
    onSaved?.({ id, ...payload })
    const r = await fetch(`/api/receipts/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (r.status === 409) {
      const j = await r.json().catch(()=>null)
      setErr('Save conflicted — reloaded latest. Please re-apply your changes.')
      // rollback to server current
      if (j?.current) {
        setForm({
          merchant_name: j.current.merchant_name || '',
          total_amount: j.current.total_amount != null ? String(j.current.total_amount) : '',
          transaction_date: j.current.transaction_date || '',
          raw_text: j.current.raw_text || '',
        })
        setVersion(j.current.updated_at || '')
        // Also inform parent to reset optimistic
        onSaved?.({ id, ...j.current })
      }
      return
    }
    if (!r.ok) { setErr('Save failed'); return }
    const j = await r.json()
    setVersion(j.receipt.updated_at)
    onSaved?.({ id, ...j.receipt })
    onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow border">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-medium">Edit Receipt</div>
          <button className="px-2 py-1" onClick={onClose}>✕</button>
        </div>
        <div className="px-4 pt-2 flex items-center gap-2 text-[11px]">
          <span className="opacity-60">Editing now:</span>
          {Object.values(peers).length===0 && <span className="opacity-60">just you</span>}
          {Object.values(peers).map(p => (
            <span key={(p as any).id} className="px-2 py-0.5 border rounded-full">{(p as any).name || (p as any).email}</span>
          ))}
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
          <div className="pt-2">
            <div className="font-medium mb-1 text-sm">History</div>
            <ReceiptHistory id={id} onRevert={()=>{/* realtime will refresh; optimistic not needed here */}} />
          </div>
        </div>
        <div className="p-3 border-t flex items-center justify-end gap-2">
          <button className="px-3 py-2 border rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-3 py-2 border rounded" onClick={save} disabled={loading}>Save</button>
        </div>
      </div>
    </div>
  )
}
