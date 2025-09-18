"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface NetWorthChartProps {
  timeRange: string
}

export function NetWorthChart({ timeRange }: NetWorthChartProps) {
  const data = [
    { month: "Jan", assets: 48200, liabilities: 5800, netWorth: 42400 },
    { month: "Feb", assets: 49100, liabilities: 5600, netWorth: 43500 },
    { month: "Mar", assets: 49800, liabilities: 5400, netWorth: 44400 },
    { month: "Apr", assets: 50200, liabilities: 5200, netWorth: 45000 },
    { month: "May", assets: 50600, liabilities: 5000, netWorth: 45600 },
    { month: "Jun", assets: 50950, liabilities: 4800, netWorth: 46150 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <p className="font-semibold text-gray-900 mb-3 text-base">{label} 2024</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between min-w-[180px]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">${(entry.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">Net Worth Growth</CardTitle>
        <p className="text-sm text-gray-600">Assets minus liabilities over time</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                strokeWidth={4}
                fill="url(#netWorthGradient)"
                name="Net Worth"
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 3, fill: "white" }}
              />
              <Line
                type="monotone"
                dataKey="assets"
                stroke="#10b981"
                strokeWidth={3}
                name="Assets"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="liabilities"
                stroke="#ef4444"
                strokeWidth={3}
                name="Liabilities"
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2, fill: "white" }}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-8 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">Net Worth</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-emerald-500" style={{ borderTop: "2px dashed #10b981" }}></div>
            <span className="text-sm font-medium text-gray-700">Assets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: "2px dashed #ef4444" }}></div>
            <span className="text-sm font-medium text-gray-700">Liabilities</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
