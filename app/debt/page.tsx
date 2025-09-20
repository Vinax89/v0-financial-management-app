"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  CreditCard,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  Target,
  Zap,
  Brain,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { DebtPayoffCalculator } from "@/components/debt-payoff-calculator"
import { RecurringBillsManager } from "@/components/recurring-bills-manager"
import { SubscriptionTracker } from "@/components/subscription-tracker"
import { AIDebtAdvisor } from "@/components/ai-debt-advisor"
import { DebtSnowballVisualizer } from "@/components/debt-snowball-visualizer"

interface DebtAccount {
  id: string
  name: string
  type: "credit_card" | "loan" | "mortgage" | "student_loan" | "other"
  balance: number
  minimumPayment: number
  interestRate: number
  dueDate: string
  lastPayment?: number
  lastPaymentDate?: string
  creditLimit?: number
}

interface RecurringExpense {
  id: string
  name: string
  amount: number
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
  category: string
  nextDue: string
  isActive: boolean
  isSubscription: boolean
}

export default function DebtManagementPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<"avalanche" | "snowball">("avalanche")
  const [timeRange, setTimeRange] = useState("12")

  // Mock debt data
  const debtAccounts: DebtAccount[] = [
    {
      id: "1",
      name: "Chase Freedom",
      type: "credit_card",
      balance: 3250,
      minimumPayment: 85,
      interestRate: 18.99,
      dueDate: "2024-02-15",
      creditLimit: 5000,
      lastPayment: 150,
      lastPaymentDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Student Loan",
      type: "student_loan",
      balance: 12500,
      minimumPayment: 145,
      interestRate: 4.5,
      dueDate: "2024-02-01",
    },
    {
      id: "3",
      name: "Car Loan",
      type: "loan",
      balance: 8750,
      minimumPayment: 285,
      interestRate: 6.2,
      dueDate: "2024-02-10",
    },
  ]

  const recurringExpenses: RecurringExpense[] = [
    {
      id: "1",
      name: "Netflix",
      amount: 15.99,
      frequency: "monthly",
      category: "Entertainment",
      nextDue: "2024-02-12",
      isActive: true,
      isSubscription: true,
    },
    {
      id: "2",
      name: "Spotify",
      amount: 9.99,
      frequency: "monthly",
      category: "Entertainment",
      nextDue: "2024-02-08",
      isActive: true,
      isSubscription: true,
    },
    {
      id: "3",
      name: "Electric Bill",
      amount: 85,
      frequency: "monthly",
      category: "Utilities",
      nextDue: "2024-02-28",
      isActive: true,
      isSubscription: false,
    },
    {
      id: "4",
      name: "Internet",
      amount: 65,
      frequency: "monthly",
      category: "Utilities",
      nextDue: "2024-02-01",
      isActive: true,
      isSubscription: false,
    },
  ]

  const totalDebt = debtAccounts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimumPayments = debtAccounts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalRecurringExpenses = recurringExpenses
    .filter((expense) => expense.isActive)
    .reduce((sum, expense) => {
      const multiplier =
        expense.frequency === "weekly"
          ? 4.33
          : expense.frequency === "quarterly"
            ? 0.33
            : expense.frequency === "yearly"
              ? 0.083
              : 1
      return sum + expense.amount * multiplier
    }, 0)

  const getDebtTypeColor = (type: string) => {
    switch (type) {
      case "credit_card":
        return "bg-red-500"
      case "student_loan":
        return "bg-blue-500"
      case "loan":
        return "bg-orange-500"
      case "mortgage":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-red-600"
    if (utilization >= 50) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Debt Management</h1>
            <p className="text-muted-foreground">
              AI-powered debt payoff strategies, bill tracking, and subscription management
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedStrategy}
              onValueChange={(value: "avalanche" | "snowball") => setSelectedStrategy(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Debt Avalanche</SelectItem>
                <SelectItem value="snowball">Debt Snowball</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalDebt.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-red-600">-2.3%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Minimums</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMinimumPayments.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Required payments</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recurring Bills</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRecurringExpenses.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Monthly total</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt-Free Date</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Mar 2027</div>
              <div className="text-sm text-muted-foreground">With current payments</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Debt Advisor */}
        <AIDebtAdvisor
          debtAccounts={debtAccounts}
          recurringExpenses={recurringExpenses}
          selectedStrategy={selectedStrategy}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payoff">Payoff Plan</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Debt Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Debt Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {debtAccounts.map((debt) => {
                    const utilization = debt.creditLimit ? (debt.balance / debt.creditLimit) * 100 : 0
                    return (
                      <div key={debt.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getDebtTypeColor(debt.type)}`} />
                            <div>
                              <div className="font-medium">{debt.name}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {debt.type.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">${debt.balance.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{debt.interestRate}% APR</div>
                          </div>
                        </div>

                        {debt.creditLimit && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Utilization</span>
                              <span className={getUtilizationColor(utilization)}>{utilization.toFixed(1)}%</span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span>Minimum Payment</span>
                          <span className="font-medium">${debt.minimumPayment}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Due Date</span>
                          <span>{new Date(debt.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Debt Snowball Visualizer */}
              <DebtSnowballVisualizer debtAccounts={debtAccounts} strategy={selectedStrategy} />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Make Payment</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Record a debt payment</span>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Schedule Payment</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Set up automatic payments</span>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Set Goal</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Create payoff target</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payoff" className="space-y-4">
            <DebtSnowballVisualizer debtAccounts={debtAccounts} strategy={selectedStrategy} />
            <DebtPayoffCalculator debtAccounts={debtAccounts} />
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <RecurringBillsManager expenses={recurringExpenses.filter((e) => !e.isSubscription)} />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <SubscriptionTracker subscriptions={recurringExpenses.filter((e) => e.isSubscription)} />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <DebtPayoffCalculator debtAccounts={debtAccounts} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Optimization Opportunity</p>
                        <p className="text-sm text-blue-700 mt-1">
                          By switching to the debt avalanche method, you could save $1,247 in interest and pay off debt
                          4 months earlier.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">High Utilization Alert</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your Chase Freedom card is at 65% utilization. Consider paying it down to improve your credit
                          score.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Great Progress!</p>
                        <p className="text-sm text-green-700 mt-1">
                          You’ve reduced your total debt by $2,340 this year. Keep up the momentum!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Subscriptions</span>
                      <span className="font-medium">$25.98</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annual Cost</span>
                      <span className="font-medium">$311.76</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unused Services</span>
                      <span className="font-medium text-red-600">$0</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3">Recommendations:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3" />
                        <span>All subscriptions are actively used</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3" />
                        <span>Consider annual plans for 15% savings</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
