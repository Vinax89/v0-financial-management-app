'use client'
import { useState, useTransition } from 'react'

export default function ExportLauncher({ scope, params }: { scope: string; params: any }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<any>()

  async function launchExport() {
    const res = await fetch(`/api/export/csv/s3/${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ params }) })
    if (!res.ok) return alert('Failed to launch export')
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button onClick={() => startTransition(launchExport)} disabled={pending} className="border rounded px-2 py-1 bg-blue-500 text-white">Export to S3</button>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>}
      {result && <div className="text-green-500">Export job created!</div>}
    </div>
  )
}
