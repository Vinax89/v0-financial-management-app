"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, DollarSign, PieChart, Target, AlertTriangle } from "lucide-react"
import {
  realTimeCalculator,
  type FinancialData,
  type TaxCalculationInputs,
  type BudgetInputs,
} from "@/lib/real-time-calculator"
import { cn } from "@/lib/utils"

export function RealTimeFinancialDashboard() {
  const [taxInputs, setTaxInputs] = useState<TaxCalculationInputs>({
    grossIncome: 75000,
    filingStatus: "single",
    state: "CA",
    zipCode: "90210",
    deductions: 14600, // Standard deduction for 2024
    exemptions: 0,
  })

  const [budgetInputs, setBudgetInputs] = useState<BudgetInputs>({
    monthlyIncome: 6250, // $75k / 12
    fixedExpenses: 2800,
    variableExpenses: 1200,
    savingsGoal: 1000,
    emergencyFund: 15000,
    debts: [
      { name: "Credit Card", balance: 5000, minimumPayment: 150, interestRate: 0.18 },
      { name: "Student Loan", balance: 25000, minimumPayment: 300, interestRate: 0.045 },
    ],
  })

  const [financialData, setFinancialData] = useState<FinancialData>({
    income: 0,
    expenses: 0,
    taxes: { federal: 0, state: 0, local: 0, payroll: 0, total: 0 },
    netIncome: 0,
    monthlyBudget: 0,
    savingsRate: 0,
    debtToIncomeRatio: 0,
    emergencyFundMonths: 0,
    projectedAnnualSavings: 0,
  })

  const [isCalculating, setIsCalculating] = useState(false)

  // Subscribe to real-time calculations
  useEffect(() => {
    const unsubscribe = realTimeCalculator.subscribe((data) => {
      setFinancialData(data)
      setIsCalculating(false)
    })

    return unsubscribe
  }, [])

  // Trigger calculations when inputs change
  useEffect(() => {
    setIsCalculating(true)
    realTimeCalculator.updateCalculations({
      tax: taxInputs,
      budget: budgetInputs,
    })
  }, [taxInputs, budgetInputs])

  const updateTaxInput = useCallback((field: keyof TaxCalculationInputs, value: any) => {
    setTaxInputs((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateBudgetInput = useCallback((field: keyof BudgetInputs, value: any) => {
    setBudgetInputs((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateDebt = useCallback((index: number, field: string, value: any) => {
    setBudgetInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((debt, i) => (i === index ? { ...debt, [field]: value } : debt)),
    }))
  }, [])

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600"
    if (value >= thresholds.warning) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (value >= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Information
            </CardTitle>
            <CardDescription>Enter your income and tax details for real-time calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grossIncome">Annual Gross Income</Label>
                <Input
                  id="grossIncome"
                  type="number"
                  value={taxInputs.grossIncome}
                  onChange={(e) => updateTaxInput("grossIncome", Number(e.target.value))}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  id="deductions"
                  type="number"
                  value={taxInputs.deductions}
                  onChange={(e) => updateTaxInput("deductions", Number(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Filing Status</Label>
                <Select value={taxInputs.filingStatus} onValueChange={(value) => updateTaxInput("filingStatus", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                    <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={taxInputs.state} onValueChange={(value) => updateTaxInput("state", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
              <Input
                id="zipCode"
                value={taxInputs.zipCode || ""}
                onChange={(e) => updateTaxInput("zipCode", e.target.value)}
                placeholder="For local tax calculations"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget & Expenses
            </CardTitle>
            <CardDescription>Track your monthly income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={budgetInputs.monthlyIncome}
                  onChange={(e) => updateBudgetInput("monthlyIncome", Number(e.target.value))}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyFund">Emergency Fund</Label>
                <Input
                  id="emergencyFund"
                  type="number"
                  value={budgetInputs.emergencyFund}
                  onChange={(e) => updateBudgetInput("emergencyFund", Number(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fixedExpenses">Fixed Expenses</Label>
                <Input
                  id="fixedExpenses"
                  type="number"
                  value={budgetInputs.fixedExpenses}
                  onChange={(e) => updateBudgetInput("fixedExpenses", Number(e.target.value))}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variableExpenses">Variable Expenses</Label>
                <Input
                  id="variableExpenses"
                  type="number"
                  value={budgetInputs.variableExpenses}
                  onChange={(e) => updateBudgetInput("variableExpenses", Number(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Debts</Label>
              {budgetInputs.debts.map((debt, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={debt.name}
                      onChange={(e) => updateDebt(index, "name", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Balance</Label>
                    <Input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => updateDebt(index, "balance", Number(e.target.value))}
                      className="text-xs text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Min Payment</Label>
                    <Input
                      type="number"
                      value={debt.minimumPayment}
                      onChange={(e) => updateDebt(index, "minimumPayment", Number(e.target.value))}
                      className="text-xs text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("transition-all duration-300", isCalculating && "opacity-50")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${financialData.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After taxes: ${financialData.taxes.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className={cn("transition-all duration-300", isCalculating && "opacity-50")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={cn("text-2xl font-bold", getHealthColor(financialData.savingsRate, { good: 20, warning: 10 }))}
            >
              {financialData.savingsRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-2">
              <Progress value={Math.min(financialData.savingsRate, 100)} className="flex-1 mr-2" />
              {getHealthBadge(financialData.savingsRate, { good: 20, warning: 10 })}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all duration-300", isCalculating && "opacity-50")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-to-Income</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                getHealthColor(100 - financialData.debtToIncomeRatio, { good: 64, warning: 50 }),
              )}
            >
              {financialData.debtToIncomeRatio.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-2">
              <Progress value={Math.min(financialData.debtToIncomeRatio, 100)} className="flex-1 mr-2" />
              {getHealthBadge(100 - financialData.debtToIncomeRatio, { good: 64, warning: 50 })}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("transition-all duration-300", isCalculating && "opacity-50")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                getHealthColor(financialData.emergencyFundMonths, { good: 6, warning: 3 }),
              )}
            >
              {financialData.emergencyFundMonths.toFixed(1)} mo
            </div>
            <div className="flex items-center justify-between mt-2">
              <Progress value={Math.min((financialData.emergencyFundMonths / 6) * 100, 100)} className="flex-1 mr-2" />
              {getHealthBadge(financialData.emergencyFundMonths, { good: 6, warning: 3 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <Card className={cn("transition-all duration-300", isCalculating && "opacity-50")}>
        <CardHeader>
          <CardTitle>Tax Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of your tax obligations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">${financialData.taxes.federal.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Federal</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${financialData.taxes.state.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">State</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${financialData.taxes.payroll.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Payroll</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${financialData.taxes.local.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Local</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <div className="text-3xl font-bold">${financialData.taxes.total.toLocaleString()}</div>
            <p className="text-muted-foreground">Total Tax Burden</p>
            <p className="text-sm text-muted-foreground">
              {((financialData.taxes.total / financialData.income) * 100).toFixed(1)}% effective tax rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
