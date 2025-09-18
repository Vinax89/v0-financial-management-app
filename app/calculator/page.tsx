"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, MapPin, TrendingUp, AlertTriangle } from "lucide-react"
import {
  calculateTaxes,
  calculatePaycheckViability,
  type TaxCalculation,
  type PaycheckViabilityResult,
} from "@/lib/tax-calculator"
import { TaxBreakdownChart } from "@/components/tax-breakdown-chart"
import { CostOfLivingComparison } from "@/components/cost-of-living-comparison"

interface CostOfLiving {
  housing: number
  food: number
  transportation: number
  healthcare: number
  utilities: number
  other: number
  total: number
}

export default function CalculatorPage() {
  const [hourlyRate, setHourlyRate] = useState("25.00")
  const [hoursPerWeek, setHoursPerWeek] = useState("40")
  const [payFrequency, setPayFrequency] = useState("biweekly")
  const [zipCode, setZipCode] = useState("10001")
  const [filingStatus, setFilingStatus] = useState("single")
  const [dependents, setDependents] = useState("0")

  // Enhanced cost of living calculation based on ZIP code
  const getCostOfLiving = (): CostOfLiving => {
    let baseMultiplier = 1.0

    // More accurate cost of living multipliers by region
    if (zipCode.startsWith("100") || zipCode.startsWith("101") || zipCode.startsWith("102")) {
      baseMultiplier = 2.2 // Manhattan
    } else if (zipCode.startsWith("11")) {
      baseMultiplier = 1.8 // Brooklyn/Queens
    } else if (zipCode.startsWith("1")) {
      baseMultiplier = 1.4 // Other NY areas
    } else if (zipCode.startsWith("9")) {
      baseMultiplier = 1.6 // California
    } else if (zipCode.startsWith("3")) {
      baseMultiplier = 0.9 // Southeast
    } else if (zipCode.startsWith("7")) {
      baseMultiplier = 0.95 // Texas
    }

    return {
      housing: 1400 * baseMultiplier,
      food: 450 * baseMultiplier,
      transportation: 350 * baseMultiplier,
      healthcare: 300 * baseMultiplier,
      utilities: 180 * baseMultiplier,
      other: 400 * baseMultiplier,
      total: 3080 * baseMultiplier,
    }
  }

  const annualGross = Number.parseFloat(hourlyRate) * Number.parseFloat(hoursPerWeek) * 52
  const taxCalculation: TaxCalculation = calculateTaxes(annualGross, filingStatus, Number.parseInt(dependents), zipCode)

  const costOfLiving = getCostOfLiving()
  const viabilityResult: PaycheckViabilityResult = calculatePaycheckViability(taxCalculation, costOfLiving.total)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Advanced Tax & Viability Calculator</h1>
            <p className="text-muted-foreground">
              Comprehensive tax burden analysis with paycheck viability assessment
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>ZIP: {zipCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Income Calculator
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
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoursPerWeek">Hours/Week</Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payFrequency">Pay Frequency</Label>
                  <Select value={payFrequency} onValueChange={setPayFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select value={filingStatus} onValueChange={setFilingStatus}>
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

                <div>
                  <Label htmlFor="dependents">Dependents</Label>
                  <Select value={dependents} onValueChange={setDependents}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Summary with Viability */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Annual Gross:</span>
                    <span className="font-medium">${taxCalculation.grossIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tax Burden:</span>
                    <span className="font-medium text-red-600">${taxCalculation.totalTaxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Annual Net:</span>
                    <span className="font-medium text-green-600">${taxCalculation.netIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Effective Tax Rate:</span>
                    <span className="font-medium">{taxCalculation.effectiveRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marginal Tax Rate:</span>
                    <span className="font-medium">{taxCalculation.marginalRate.toFixed(1)}%</span>
                  </div>

                  {/* Viability Status */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      {viabilityResult.status === "insufficient" || viabilityResult.status === "challenging" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-sm font-medium ${viabilityResult.statusColor}`}>
                        {viabilityResult.statusMessage}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Viability Ratio: {viabilityResult.viabilityRatio.toFixed(2)}x
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paycheck Viability Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Paycheck Viability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${(viabilityResult.monthlyNet / 1000).toFixed(1)}k
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Net Income</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ${(viabilityResult.monthlyExpenses / 1000).toFixed(1)}k
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Expenses</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div
                      className={`text-2xl font-bold ${viabilityResult.surplus >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${Math.abs(viabilityResult.surplus / 1000).toFixed(1)}k
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monthly {viabilityResult.surplus >= 0 ? "Surplus" : "Deficit"}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    viabilityResult.status === "excellent"
                      ? "bg-green-50 border-green-500"
                      : viabilityResult.status === "good"
                        ? "bg-blue-50 border-blue-500"
                        : viabilityResult.status === "adequate"
                          ? "bg-yellow-50 border-yellow-500"
                          : viabilityResult.status === "challenging"
                            ? "bg-orange-50 border-orange-500"
                            : "bg-red-50 border-red-500"
                  }`}
                >
                  <h4 className={`font-semibold mb-2 ${viabilityResult.statusColor}`}>
                    Financial Status: {viabilityResult.status.charAt(0).toUpperCase() + viabilityResult.status.slice(1)}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">{viabilityResult.statusMessage}</p>
                  <div className="space-y-1">
                    <h5 className="font-medium text-sm">Recommendations:</h5>
                    {viabilityResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="taxes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="taxes">Tax Breakdown</TabsTrigger>
                <TabsTrigger value="cost-of-living">Cost of Living</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              </TabsList>

              <TabsContent value="taxes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comprehensive Tax Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="font-medium">
                          ${taxCalculation.federalTax.toLocaleString()} (
                          {taxCalculation.breakdown.federalEffectiveRate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Tax:</span>
                        <span className="font-medium">
                          ${taxCalculation.stateTax.toLocaleString()} (
                          {taxCalculation.breakdown.stateEffectiveRate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Tax:</span>
                        <span className="font-medium">
                          ${taxCalculation.localTax.toLocaleString()} (
                          {taxCalculation.breakdown.localEffectiveRate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Security:</span>
                        <span className="font-medium">${taxCalculation.socialSecurity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medicare:</span>
                        <span className="font-medium">${taxCalculation.medicare.toLocaleString()}</span>
                      </div>
                      {taxCalculation.additionalMedicare > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Medicare:</span>
                          <span className="font-medium">${taxCalculation.additionalMedicare.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total Tax Burden:</span>
                        <span>${taxCalculation.totalTaxes.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Payroll Taxes: {taxCalculation.breakdown.payrollTaxRate.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>

                  <TaxBreakdownChart taxCalculation={taxCalculation} />
                </div>
              </TabsContent>

              <TabsContent value="cost-of-living" className="space-y-4">
                <CostOfLivingComparison
                  costOfLiving={costOfLiving}
                  monthlyNet={viabilityResult.monthlyNet}
                  zipCode={zipCode}
                />
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overtime Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[45, 50, 55, 60].map((hours) => {
                        const overtimeHours = hours - 40
                        const regularPay = 40 * Number.parseFloat(hourlyRate) * 52
                        const overtimePay = overtimeHours * Number.parseFloat(hourlyRate) * 1.5 * 52
                        const totalGross = regularPay + overtimePay
                        const estimatedNet = totalGross * (1 - taxCalculation.effectiveRate / 100)
                        const monthlyNet = estimatedNet / 12

                        return (
                          <div key={hours} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div>
                              <div className="font-medium">{hours} hrs/week</div>
                              <div className="text-sm text-muted-foreground">+{overtimeHours} OT hours</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${(monthlyNet / 1000).toFixed(1)}k/mo</div>
                              <div className="text-sm text-green-600">
                                +${((monthlyNet - viabilityResult.monthlyNet) / 1000).toFixed(1)}k
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Raise Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[1, 2, 3, 5].map((raise) => {
                        const newRate = Number.parseFloat(hourlyRate) + raise
                        const newGross = newRate * Number.parseFloat(hoursPerWeek) * 52
                        const estimatedNet = newGross * (1 - taxCalculation.effectiveRate / 100)
                        const monthlyNet = estimatedNet / 12
                        const increase = monthlyNet - viabilityResult.monthlyNet

                        return (
                          <div key={raise} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div>
                              <div className="font-medium">+${raise}/hour</div>
                              <div className="text-sm text-muted-foreground">${newRate.toFixed(2)}/hour</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${(monthlyNet / 1000).toFixed(1)}k/mo</div>
                              <div className="text-sm text-green-600">+${(increase / 1000).toFixed(1)}k</div>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
