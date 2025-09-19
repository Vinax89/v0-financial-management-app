'use client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Preset = { id: string, name: string, params: any, updated_at: string }

export default function PresetBar({ scope, currentParams }: { scope: string; currentParams: any }) {
  const [presets, setPresets] = useState<Preset[]>()
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function loadPresets() {
    const res = await fetch(`/api/presets/${scope}`)
    if (!res.ok) return alert('Failed to load presets')
    const data = await res.json()
    setPresets(data.presets)
  }

  async function savePreset() {
    if (!name) return alert('Enter a name for the preset')
    const res = await fetch(`/api/presets/${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, params: currentParams }) })
    if (!res.ok) return alert('Failed to save preset')
    startTransition(loadPresets)
  }

  async function applyPreset(preset: Preset) {
    const qs = new URLSearchParams(preset.params).toString()
    router.push(`?${qs}`)
  }

  async function deletePreset(presetId: string) {
    const res = await fetch(`/api/presets/${scope}/${presetId}`, { method: 'DELETE' })
    if (!res.ok) return alert('Failed to delete preset')
    startTransition(loadPresets)
  }

  async function sharePreset(presetId: string) {
    const res = await fetch(`/api/presets/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presetId }) })
    if (!res.ok) return alert('Failed to create share link')
    const { shareUrl } = await res.json()
    prompt('Share this link:', shareUrl)
  }

  useEffect(() => { startTransition(loadPresets) }, [scope])

  return (
    <div className="flex items-center gap-2 text-sm">
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
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>}
    </div>
  )
}
