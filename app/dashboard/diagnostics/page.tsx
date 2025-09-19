import RateLimitPanel from '@/components/diagnostics/RateLimitPanel'

export default async function DiagnosticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Diagnostics</h1>
      <RateLimitPanel id="dashboard" />
    </div>
  )
}
