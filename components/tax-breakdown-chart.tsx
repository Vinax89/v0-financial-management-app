"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TaxCalculation {
  grossIncome: number
  federalTax: number
  stateTax: number
  localTax: number
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  totalTaxes: number
  netIncome: number
  effectiveRate: number
  marginalRate: number
  breakdown: {
    federalEffectiveRate: number
    stateEffectiveRate: number
    localEffectiveRate: number
    payrollTaxRate: number
  }
}

interface TaxBreakdownChartProps {
  taxCalculation: TaxCalculation
}

export function TaxBreakdownChart({ taxCalculation }: TaxBreakdownChartProps) {
  const data = [
    {
      name: "Take-Home Pay",
      value: taxCalculation.netIncome,
      color: "#10b981",
    },
    {
      name: "Federal Tax",
      value: taxCalculation.federalTax,
      color: "#3b82f6",
    },
    {
      name: "State Tax",
      value: taxCalculation.stateTax,
      color: "#8b5cf6",
    },
    {
      name: "Local Tax",
      value: taxCalculation.localTax,
      color: "#f59e0b",
    },
    {
      name: "Social Security",
      value: taxCalculation.socialSecurity,
      color: "#ec4899",
    },
    {
      name: "Medicare",
      value: taxCalculation.medicare + taxCalculation.additionalMedicare,
      color: "#06b6d4",
    },
  ].filter((item) => item.value > 0) // Only show non-zero values

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / taxCalculation.grossIncome) * 100).toFixed(1)
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <p className="font-semibold text-card-foreground">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-card-foreground">${data.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{percentage}% of gross income</p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = () => {
    return (
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border">
        {data.map((entry, index) => {
          const percentage = ((entry.value / taxCalculation.grossIncome) * 100).toFixed(1)
          return (
            <div
              key={index}
              className="flex items-center justify-between text-sm group hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-medium text-foreground">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground">{percentage}%</span>
                <p className="text-xs text-muted-foreground">${entry.value.toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-foreground">Income Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">How your gross income is allocated</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
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
        <CustomLegend />

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{taxCalculation.effectiveRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Effective Tax Rate</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{taxCalculation.marginalRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Marginal Tax Rate</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">${taxCalculation.netIncome.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Annual Take-Home</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">${taxCalculation.totalTaxes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Tax Burden</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
