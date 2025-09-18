"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, MapPin, TrendingUp, AlertTriangle } from "lucide-react"
import { calculateTaxes, calculatePaycheckViability } from "@/lib/tax-calculator"
import { useDebounce, useMemoizedCalculation } from "@/lib/performance-utils"
import { TaxBreakdownChart, CostOfLivingComparison } from "@/components/lazy-components"

export function OptimizedCalculator() {
  const [inputs, setInputs] = useState({
    hourlyRate: "25.00",
    hoursPerWeek: "40",
    payFrequency: "biweekly",
    zipCode: "10001",
    filingStatus: "single",
    dependents: "0",
  })

  // Debounced input handler to prevent excessive calculations
  const debouncedUpdateInput = useDebounce(
    useCallback((key: string, value: string) => {
      setInputs((prev) => ({ ...prev, [key]: value }))
    }, []),
    300,
  )

  // Memoized calculations to prevent unnecessary recalculations
  const calculations = useMemoizedCalculation(() => {
    const annualGross = Number.parseFloat(inputs.hourlyRate) * Number.parseFloat(inputs.hoursPerWeek) * 52
    const taxCalculation = calculateTaxes(
      annualGross,
      inputs.filingStatus,
      Number.parseInt(inputs.dependents),
      inputs.zipCode,
    )

    // Enhanced cost of living calculation
    let baseMultiplier = 1.0
    if (inputs.zipCode.startsWith("100") || inputs.zipCode.startsWith("101") || inputs.zipCode.startsWith("102")) {
      baseMultiplier = 2.2 // Manhattan
    } else if (inputs.zipCode.startsWith("11")) {
      baseMultiplier = 1.8 // Brooklyn/Queens
    } else if (inputs.zipCode.startsWith("1")) {
      baseMultiplier = 1.4 // Other NY areas
    } else if (inputs.zipCode.startsWith("9")) {
      baseMultiplier = 1.6 // California
    } else if (inputs.zipCode.startsWith("3")) {
      baseMultiplier = 0.9 // Southeast
    } else if (inputs.zipCode.startsWith("7")) {
      baseMultiplier = 0.95 // Texas
    }

    const costOfLiving = {
      housing: 1400 * baseMultiplier,
      food: 450 * baseMultiplier,
      transportation: 350 * baseMultiplier,
      healthcare: 300 * baseMultiplier,
      utilities: 180 * baseMultiplier,
      other: 400 * baseMultiplier,
      total: 3080 * baseMultiplier,
    }

    const viabilityResult = calculatePaycheckViability(taxCalculation, costOfLiving.total)

    return { taxCalculation, costOfLiving, viabilityResult }
  }, [inputs.hourlyRate, inputs.hoursPerWeek, inputs.filingStatus, inputs.dependents, inputs.zipCode])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Optimized Tax Calculator</h1>
            <p className="text-muted-foreground">High-performance tax analysis with real-time calculations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>ZIP: {inputs.zipCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Optimized Input Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Quick Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      defaultValue={inputs.hourlyRate}
                      onChange={(e) => debouncedUpdateInput("hourlyRate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoursPerWeek">Hours/Week</Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      defaultValue={inputs.hoursPerWeek}
                      onChange={(e) => debouncedUpdateInput("hoursPerWeek", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    defaultValue={inputs.zipCode}
                    onChange={(e) => debouncedUpdateInput("zipCode", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select
                    value={inputs.filingStatus}
                    onValueChange={(value) => debouncedUpdateInput("filingStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head-of-household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Real-time Summary */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Annual Gross:</span>
                    <span className="font-medium">${calculations.taxCalculation.grossIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tax Burden:</span>
                    <span className="font-medium text-red-600">
                      ${calculations.taxCalculation.totalTaxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Net:</span>
                    <span className="font-medium text-green-600">
                      ${calculations.taxCalculation.netIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Effective Rate:</span>
                    <span className="font-medium">{calculations.taxCalculation.effectiveRate.toFixed(1)}%</span>
                  </div>

                  {/* Viability Status */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      {calculations.viabilityResult.status === "insufficient" ||
                      calculations.viabilityResult.status === "challenging" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-sm font-medium ${calculations.viabilityResult.statusColor}`}>
                        {calculations.viabilityResult.statusMessage}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel with Lazy Loading */}
          <div className="lg:col-span-2 space-y-6">
            <TaxBreakdownChart taxCalculation={calculations.taxCalculation} />
            <CostOfLivingComparison
              costOfLiving={calculations.costOfLiving}
              monthlyNet={calculations.viabilityResult.monthlyNet}
              zipCode={inputs.zipCode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
