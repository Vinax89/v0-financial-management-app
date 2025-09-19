import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminJobsPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const sb = await getSupabaseServerClient()
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const size = Math.min(100, Math.max(10, parseInt(searchParams.size || '25')))
  const offset = (page - 1) * size
  const { data: rows, error } = await sb.rpc('admin_list_export_jobs_paged', { p_limit: size, p_offset: offset })
  const { data: cnt } = await sb.rpc('admin_count_export_jobs')
  if (error) throw error

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Failed Jobs</h1>
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Total: {cnt || 0}</div>
        <div className="flex items-center gap-2">
          {page>1 && <a className="px-2 py-1 border rounded" href={`?page=${page-1}&size=${size}`}>Prev</a>}
          <a className="px-2 py-1 border rounded" href={`?page=${page+1}&size=${size}`}>Next</a>
        </div>
      </div>
      <div className="overflow-x-auto border rounded mt-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {(rows||[]).map((j:any)=> (
              <tr key={j.id} className="border-t align-top">
                <td className="p-2 font-mono">{j.id}</td>
                <td className="p-2">{new Date(j.created_at).toLocaleString()}</td>
                <td className="p-2"><span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">{j.status}</span></td>
                <td className="p-2 font-mono text-red-500">{j.last_error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
