"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface SpendingBreakdownChartProps {
  timeRange: string
}

export function SpendingBreakdownChart({ timeRange }: SpendingBreakdownChartProps) {
  const data = [
    { name: "Housing", value: 1200, color: "#3b82f6", percentage: 32.9 },
    { name: "Food & Groceries", value: 450, color: "#10b981", percentage: 12.3 },
    { name: "Transportation", value: 380, color: "#f59e0b", percentage: 10.4 },
    { name: "Utilities", value: 220, color: "#8b5cf6", percentage: 6.0 },
    { name: "Entertainment", value: 180, color: "#ec4899", percentage: 4.9 },
    { name: "Healthcare", value: 150, color: "#ef4444", percentage: 4.1 },
    { name: "Shopping", value: 320, color: "#06b6d4", percentage: 8.8 },
    { name: "Other", value: 748, color: "#64748b", percentage: 20.5 },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <p className="font-semibold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">${data.value.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{data.payload.percentage}% of total spending</p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm group hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium text-gray-700">{entry.name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-900">{entry.percentage}%</span>
              <p className="text-xs text-gray-500">${entry.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">Spending Breakdown</CardTitle>
        <p className="text-sm text-gray-600">Where your money goes each month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={130}
                paddingAngle={3}
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend payload={data} />
      </CardContent>
    </Card>
  )
}
