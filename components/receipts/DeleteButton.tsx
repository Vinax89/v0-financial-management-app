// components/receipts/DeleteButton.tsx
'use client'
export default function DeleteButton({ id, onDone }: { id: string; onDone?: () => void }) {
  async function del() {
    if (!confirm('Delete this receipt?')) return
    const res = await fetch(`/api/receipts/${id}/delete`, { method: 'POST' })
    if (res.ok) onDone?.()
  }
  return <button className="px-2 py-1 border rounded" onClick={del}>Delete</button>
}
