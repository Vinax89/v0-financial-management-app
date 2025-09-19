'use client'
import * as React from 'react'

type WS = { id: string; name: string; role: 'owner'|'admin'|'member' }
export default function WorkspaceSwitcher() {
  const [items, setItems] = React.useState<WS[]>([])
  const [sel, setSel] = React.useState('')
  React.useEffect(() => { (async()=>{
    const r = await fetch('/api/workspaces'); const j = await r.json(); setItems(j.workspaces||[]); setSel(j.workspaces?.[0]?.id||'')
  })() }, [])
  async function change(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value; setSel(id)
    await fetch('/api/workspaces/active', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ workspaceId: id }) })
    location.reload()
  }
  return (
    <select className="border rounded p-2" value={sel} onChange={change}>
      {items.map(w => <option key={w.id} value={w.id}>{w.name} {w.role!=='owner'?`(${w.role})`: ''}</option>)}
    </select>
  )
}
