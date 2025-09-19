'use client'
import { useEffect, useState, useTransition } from 'react'

export default function AdminPageClient() {
  const [presets, setPresets] = useState<any[]>([])
  const [pending, startTransition] = useTransition()

  async function loadData() {
    const res = await fetch('/api/admin/all-presets')
    const json = await res.json()
    setPresets(json.presets)
  }

  useEffect(() => { startTransition(loadData) }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin</h1>
      <p>Superuser dashboard for managing the application.</p>
      <div className="mt-8">
        <h2 className="text-xl font-bold">All Presets</h2>
        <div className="flex flex-wrap gap-4 mt-4">
          {presets.map(p => (
            <div key={p.id} className="border rounded p-4 w-96">
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-sm text-gray-500">Scope: {p.scope}</div>
              <div className="text-sm text-gray-500">Owner: {p.user_email}</div>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(p.params, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
