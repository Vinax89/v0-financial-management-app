'use client'

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  AlertCircle,
  Calendar,
  Calculator,
  Database,
  Zap,
} from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { SpendingBreakdownChart } from "@/components/spending-breakdown-chart"
import { NetWorthChart } from "@/components/net-worth-chart"
import { BudgetProgressChart } from "@/components/budget-progress-chart"
import { FinancialGoalsCard } from "@/components/financial-goals-card"
import { RecentTransactionsCard } from "@/components/recent-transactions-card"
import { UpcomingBillsCard } from "@/components/upcoming-bills-card"
import { RealTimeFinancialDashboard } from "@/components/real-time-financial-dashboard"
import { UnifiedCalendar } from "@/components/unified-calendar"
import { FinancialOverviewDashboard } from "@/components/financial-overview-dashboard"
import { TransactionEntryForm } from "@/components/transaction-entry-form"
import { QuickTransactionButtons } from "@/components/quick-transaction-buttons"
import { TaxDataUpdater } from "@/components/tax-data-updater"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { AIFinancialInsights } from "@/components/ai-financial-insights"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { InvestmentTracker } from "@/components/investment-tracker"

interface DashboardData {
  netWorth: number
  netWorthChange: number
  totalIncome: number
  totalExpenses: number
  cashFlow: number
  savingsRate: number
  budgetUtilization: number
  creditUtilization: number
}

export default function DashboardClient({ stats }: { stats: { cached: number; hints: number } }) {
  const [timeRange, setTimeRange] = useState("30")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [activeView, setActiveView] = useState("overview")

  const dashboardData: DashboardData = useMemo(
    () => ({
      netWorth: 45750,
      netWorthChange: 2340,
      totalIncome: 4800,
      totalExpenses: 3650,
      cashFlow: 1150,
      savingsRate: 24,
      budgetUtilization: 76,
      creditUtilization: 23,
    }),
    [],
  )

  const getChangeColor = useCallback((value: number) => (value >= 0 ? "text-green-600" : "text-red-600"), [])
  const getChangeIcon = useCallback(
    (value: number) => (value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />),
    [],
  )

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value)
  }, [])

  const handleAccountChange = useCallback((value: string) => {
    setSelectedAccount(value)
  }, [])

  const handleActiveViewChange = useCallback((value: string) => {
    setActiveView(value)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Your complete financial overview with real-time calculations and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAccount} onValueChange={handleAccountChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Cards</SelectItem>
                <SelectItem value="investment">Investments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <FinancialOverviewDashboard />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData.netWorth.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(dashboardData.netWorthChange)}`}>
                {getChangeIcon(dashboardData.netWorthChange)}
                <span>
                  {dashboardData.netWorthChange >= 0 ? "+" : ""}$
                  {Math.abs(dashboardData.netWorthChange).toLocaleString()}
                </span>
                <span className="text-muted-foreground">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${dashboardData.totalIncome.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-green-600">+5.2%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${dashboardData.totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                <span className="text-red-600">+2.1%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getChangeColor(dashboardData.cashFlow)}`}>
                ${dashboardData.cashFlow.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-blue-600">{dashboardData.savingsRate}%</span> savings rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{dashboardData.budgetUtilization}%</span>
                <Badge variant={dashboardData.budgetUtilization > 90 ? "destructive" : "default"}>
                  {dashboardData.budgetUtilization > 90 ? "High" : "Good"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${dashboardData.budgetUtilization > 90 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(dashboardData.budgetUtilization, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{dashboardData.creditUtilization}%</span>
                <Badge variant={dashboardData.creditUtilization > 30 ? "destructive" : "default"}>
                  {dashboardData.creditUtilization > 30 ? "High" : "Good"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${dashboardData.creditUtilization > 30 ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(dashboardData.creditUtilization, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{dashboardData.savingsRate}%</span>
                <Badge variant={dashboardData.savingsRate < 10 ? "destructive" : "default"}>
                  {dashboardData.savingsRate >= 20 ? "Excellent" : dashboardData.savingsRate >= 10 ? "Good" : "Low"}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${Math.min(dashboardData.savingsRate * 2, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <QuickTransactionButtons />

        {/* AI Financial Insights */}
        <AIFinancialInsights />

        {/* Main Charts and Features */}
        <Tabs value={activeView} onValueChange={handleActiveViewChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CashFlowChart timeRange={timeRange} />
              <SpendingBreakdownChart timeRange={timeRange} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NetWorthChart timeRange={timeRange} />
              </div>
              <div className="space-y-4">
                <RecentTransactionsCard />
                <UpcomingBillsCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spending" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingBreakdownChart timeRange={timeRange} />
              <BudgetProgressChart />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Dining Out Alert</p>
                      <p className="text-sm text-yellow-700">
                        You’ve spent 23% more on dining out this month compared to your average.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Great Job on Utilities!</p>
                      <p className="text-sm text-green-700">
                        Your utility costs are 15% lower than last month. Keep it up!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <TransactionEntryForm />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <NetWorthChart timeRange={timeRange} />
              <CashFlowChart timeRange={timeRange} />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <FinancialGoalsCard />
          </TabsContent>

          <TabsContent value="investments" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Investment Portfolio</h2>
            </div>
            <PortfolioOverview />
            <InvestmentTracker />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Real-Time Financial Calculator</h2>
            </div>
            <RealTimeFinancialDashboard />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Financial Calendar</h2>
            </div>
            <UnifiedCalendar />
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-semibold">System Administration</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaxDataUpdater />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tax Data</span>
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cache Performance</span>
                      <Badge className="bg-blue-100 text-blue-800">Optimal</Badge>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Detailed Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <PerformanceMonitor stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
