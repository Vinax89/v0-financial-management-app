"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingDown, DollarSign, Calendar } from "lucide-react"

interface DebtAccount {
  id: string
  name: string
  balance: number
  minimumPayment: number
  interestRate: number
}

interface DebtPayoffCalculatorProps {
  debtAccounts: DebtAccount[]
}

export function DebtPayoffCalculator({ debtAccounts }: DebtPayoffCalculatorProps) {
  const [extraPayment, setExtraPayment] = useState("100")
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche")

  // Calculate payoff scenarios
  const calculatePayoff = (extraAmount: number, method: "avalanche" | "snowball") => {
    // Simplified calculation - in real app would use proper amortization
    const totalDebt = debtAccounts.reduce((sum, debt) => sum + debt.balance, 0)
    const totalMinimum = debtAccounts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalPayment = totalMinimum + extraAmount

    const avgInterestRate = debtAccounts.reduce((sum, debt) => sum + debt.interestRate * debt.balance, 0) / totalDebt

    // Simplified payoff calculation
    const monthlyRate = avgInterestRate / 100 / 12
    const months = Math.log(1 + (totalDebt * monthlyRate) / totalPayment) / Math.log(1 + monthlyRate)

    return {
      months: Math.ceil(months),
      totalInterest: totalPayment * months - totalDebt,
      monthlyPayment: totalPayment,
    }
  }

  const currentScenario = calculatePayoff(0, strategy)
  const improvedScenario = calculatePayoff(Number.parseFloat(extraPayment) || 0, strategy)
  const savings = currentScenario.totalInterest - improvedScenario.totalInterest
  const timeSaved = currentScenario.months - improvedScenario.months

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Debt Payoff Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="extra-payment"
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  className="pl-9"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Payoff Strategy</Label>
              <Select value={strategy} onValueChange={(value: "avalanche" | "snowball") => setStrategy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                  <SelectItem value="snowball">Debt Snowball (Lowest Balance First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Current Plan
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payoff Time</span>
                  <span className="font-medium">{currentScenario.months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-medium text-red-600">${currentScenario.totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-medium">${currentScenario.monthlyPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Improved Plan */}
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                With Extra Payment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payoff Time</span>
                  <span className="font-medium text-green-600">{improvedScenario.months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-medium text-green-600">${improvedScenario.totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-medium">${improvedScenario.monthlyPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium mb-3 text-blue-800">Potential Savings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Interest Saved: </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ${Math.max(0, savings).toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Time Saved: </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {Math.max(0, timeSaved)} months
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Apply This Plan
            </Button>
            <Button variant="outline">Save Scenario</Button>
            <Button variant="ghost">Export Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
