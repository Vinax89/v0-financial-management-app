'use client'
import { useState, useTransition } from 'react'
import { useToast } from '@/components/toast/ToastProvider'

export default function ExportLauncher({ scope, params }: { scope: string; params: any }) {
  const [pending, startTransition] = useTransition()
  const toast = useToast()

  async function launchExport() {
    const res = await fetch(`/api/export/csv/s3/${scope}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ params }) })
    if (!res.ok) {
      toast.error('Failed to launch export')
    } else {
      const data = await res.json()
      toast.success('Export job created!')
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button onClick={() => startTransition(launchExport)} disabled={pending} className="border rounded px-2 py-1 bg-blue-500 text-white">Export to S3</button>
      {pending && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>}
    </div>
  )
}
