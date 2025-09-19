'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function NetCashflowChart({ rows }: { rows: { month: string; net_cashflow: number; net_cashflow_avg_3m: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: any) => (typeof v === 'number' ? v.toFixed(2) : v)} />
          <Line type="monotone" dataKey="net_cashflow" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="net_cashflow_avg_3m" dot={false} strokeWidth={2} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
