'use client'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatReset(ts: number) {
  const d = new Date(Number(ts) * 1000)
  return `${d.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
}

export default function RateLimitPanel({ id = 'dashboard' }: { id?: string }) {
  const [data, setData] = React.useState<{ ok: boolean; limit: number; remaining: number; reset: number } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStatus = React.useCallback(async (consume = false) => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/limits/ping?id=${encodeURIComponent(id)}${consume ? '' : '&probe=1'}`
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      if (!res.ok) setError('Rate limit reached')
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => { fetchStatus(false) }, [fetchStatus])

  const remaining = data?.remaining ?? 0
  const limit = data?.limit ?? 0
  const reset = data?.reset ?? 0
  const pct = limit ? Math.max(0, Math.min(100, Math.round((remaining / limit) * 100))) : 0

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>API Rate Limit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">Bucket ID: <code>{id}</code></div>
        <div className="text-sm">Limit: <strong>{limit}</strong></div>
        <div className="text-sm">Remaining: <strong>{remaining}</strong></div>
        <div className="text-sm">Resets at: <strong>{reset ? formatReset(reset) : '—'}</strong></div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%` }} />
        </div>
        {error && <div className="text-xs">{error}</div>}
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={() => fetchStatus(false)} disabled={loading}>Refresh</Button>
        <Button variant="secondary" onClick={() => fetchStatus(true)} disabled={loading}>Consume 1</Button>
      </CardFooter>
    </Card>
  )
}
