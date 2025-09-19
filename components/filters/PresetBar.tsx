'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

type Preset = { id: string, name: string, params: any, updated_at: string }

export default function PresetBar({ scope, currentParams }: { scope: string; currentParams: Record<string, any> }) {
  const [presets, setPresets] = React.useState<Preset[]>([])
  const [name, setName] = React.useState('')
  const [shareEmail, setShareEmail] = React.useState('')
  const [shareCanEdit, setShareCanEdit] = React.useState(false)
  const [accessible, setAccessible] = React.useState<any[]>([])
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  const reload = async () => {
    const res = await fetch(`/api/presets/${encodeURIComponent(scope)}`, { cache: 'no-store' })
    const json = await res.json(); setPresets(json.presets || [])
    const r2 = await fetch('/api/presets/accessible', { cache: 'no-store' })
    const j2 = await r2.json(); setAccessible(j2.presets || [])
  }

  async function savePreset() {
    if (!name) return alert('Enter a name for the preset')
    const res = await fetch(`/api/presets/${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, params: currentParams }) })
    if (!res.ok) return alert('Failed to save preset')
    startTransition(reload)
  }

  async function applyPreset(preset: Preset) {
    const usp = new URLSearchParams()
    Object.entries(preset.params || {}).forEach(([k, v]: any) => {
      if (Array.isArray(v)) {
        v.forEach((x: any) => usp.append(k, x))
      } else if (v != null && v !== '') {
        usp.set(k, String(v))
      }
    })
    router.push(`?${usp.toString()}`)
  }

  async function deletePreset(presetId: string) {
    const res = await fetch(`/api/presets/${scope}/${presetId}`, { method: 'DELETE' })
    if (!res.ok) return alert('Failed to delete preset')
    startTransition(reload)
  }

  async function sharePreset(presetId: string) {
    const res = await fetch(`/api/presets/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presetId }) })
    if (!res.ok) return alert('Failed to create share link')
    const { shareUrl } = await res.json()
    prompt('Share this link:', shareUrl)
  }

  React.useEffect(() => { startTransition(reload) }, [scope])

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="New preset name..." className="border rounded px-2 py-1" />
      <button onClick={savePreset} disabled={pending} className="border rounded px-2 py-1 bg-gray-100">Save Preset</button>
      <div className="border-l h-6" />
      <div className="flex items-center gap-2">
        {presets?.map(p => (
          <div key={p.id} className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50">
            <button onClick={() => applyPreset(p)}>{p.name}</button>
            <button onClick={() => sharePreset(p.id)} className="text-blue-500">Share</button>
            <button onClick={() => deletePreset(p.id)} className="text-red-500">x</button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input className="border rounded p-2" placeholder="Share to email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={shareCanEdit} onChange={e => setShareCanEdit(e.target.checked)} /> can edit</label>
        <button className="px-3 py-2 border rounded" onClick={async () => {
          if (!presets || presets.length === 0) return
          await fetch('/api/presets/share-email', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ presetId: presets[0].id, email: shareEmail, canEdit: shareCanEdit }) })
          setShareEmail(''); setShareCanEdit(false); await reload()
        }}>Share</button>
      </div>

      {accessible.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Shared with me:</span>
          {accessible.filter((p: any) => p.role === 'grantee' && p.scope === scope).slice(0, 5).map((p: any) => (
            <button key={p.id} className="underline" onClick={() => applyPreset(p)}>{p.name}</button>
          ))}
        </div>
      )}

      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>}
    </div>
  )
}
