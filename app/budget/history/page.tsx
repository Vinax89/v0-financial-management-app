"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, TrendingUp, DollarSign, Target, Download } from "lucide-react"

interface BudgetPeriod {
  id: string
  name: string
  startDate: Date
  endDate: Date
  totalBudget: number
  totalSpent: number
  categories: BudgetCategory[]
  status: "active" | "completed" | "exceeded"
}

interface BudgetCategory {
  id: string
  name: string
  budgeted: number
  spent: number
  remaining: number
  color: string
}

export default function BudgetHistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [budgetHistory, setBudgetHistory] = useState<BudgetPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBudgetHistory()
  }, [selectedPeriod])

  const loadBudgetHistory = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockHistory: BudgetPeriod[] = [
        {
          id: "1",
          name: "December 2024",
          startDate: new Date("2024-12-01"),
          endDate: new Date("2024-12-31"),
          totalBudget: 4500,
          totalSpent: 4200,
          status: "completed",
          categories: [
            { id: "1", name: "Food & Dining", budgeted: 800, spent: 750, remaining: 50, color: "#f59e0b" },
            { id: "2", name: "Transportation", budgeted: 400, spent: 380, remaining: 20, color: "#3b82f6" },
            { id: "3", name: "Shopping", budgeted: 600, spent: 720, remaining: -120, color: "#ec4899" },
            { id: "4", name: "Bills & Utilities", budgeted: 1200, spent: 1150, remaining: 50, color: "#ef4444" },
            { id: "5", name: "Entertainment", budgeted: 300, spent: 280, remaining: 20, color: "#06b6d4" },
          ],
        },
        {
          id: "2",
          name: "November 2024",
          startDate: new Date("2024-11-01"),
          endDate: new Date("2024-11-30"),
          totalBudget: 4500,
          totalSpent: 4100,
          status: "completed",
          categories: [
            { id: "1", name: "Food & Dining", budgeted: 800, spent: 820, remaining: -20, color: "#f59e0b" },
            { id: "2", name: "Transportation", budgeted: 400, spent: 350, remaining: 50, color: "#3b82f6" },
            { id: "3", name: "Shopping", budgeted: 600, spent: 580, remaining: 20, color: "#ec4899" },
            { id: "4", name: "Bills & Utilities", budgeted: 1200, spent: 1200, remaining: 0, color: "#ef4444" },
            { id: "5", name: "Entertainment", budgeted: 300, spent: 150, remaining: 150, color: "#06b6d4" },
          ],
        },
        {
          id: "3",
          name: "October 2024",
          startDate: new Date("2024-10-01"),
          endDate: new Date("2024-10-31"),
          totalBudget: 4200,
          totalSpent: 3950,
          status: "completed",
          categories: [
            { id: "1", name: "Food & Dining", budgeted: 750, spent: 700, remaining: 50, color: "#f59e0b" },
            { id: "2", name: "Transportation", budgeted: 350, spent: 400, remaining: -50, color: "#3b82f6" },
            { id: "3", name: "Shopping", budgeted: 550, spent: 600, remaining: -50, color: "#ec4899" },
            { id: "4", name: "Bills & Utilities", budgeted: 1150, spent: 1100, remaining: 50, color: "#ef4444" },
            { id: "5", name: "Entertainment", budgeted: 250, spent: 150, remaining: 100, color: "#06b6d4" },
          ],
        },
      ]

      setBudgetHistory(mockHistory)
    } catch (error) {
      console.error("Failed to load budget history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = budgetHistory.map((period) => ({
    name: period.name,
    budgeted: period.totalBudget,
    spent: period.totalSpent,
    variance: period.totalBudget - period.totalSpent,
  }))

  const categoryTrendData =
    budgetHistory.length > 0
      ? budgetHistory[0].categories.map((category) => {
          const historicalData = budgetHistory.map((period) => {
            const cat = period.categories.find((c) => c.name === category.name)
            return {
              period: period.name,
              budgeted: cat?.budgeted || 0,
              spent: cat?.spent || 0,
            }
          })
          return {
            name: category.name,
            color: category.color,
            data: historicalData,
          }
        })
      : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "exceeded":
        return "destructive"
      case "active":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600"
    if (variance < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold">Budget History</h1>
          <div className="w-32 h-10 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Budget History</h1>
          <p className="text-muted-foreground">Track your budget performance over time</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Budget</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(budgetHistory.reduce((sum, p) => sum + p.totalBudget, 0) / budgetHistory.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Across {budgetHistory.length} periods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Spending</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(budgetHistory.reduce((sum, p) => sum + p.totalSpent, 0) / budgetHistory.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (budgetHistory.reduce((sum, p) => sum + p.totalSpent, 0) /
                  budgetHistory.reduce((sum, p) => sum + p.totalBudget, 0)) *
                100
              ).toFixed(1)}
              % of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                budgetHistory.reduce((best, current) =>
                  current.totalBudget - current.totalSpent > best.totalBudget - best.totalSpent ? current : best,
                ).name
              }
            </div>
            <p className="text-xs text-muted-foreground">Highest savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Adherence</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (budgetHistory.filter((p) => p.totalSpent <= p.totalBudget).length / budgetHistory.length) *
                100
              ).toFixed(0)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetHistory.filter((p) => p.totalSpent <= p.totalBudget).length} of {budgetHistory.length} months
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Category Trends</TabsTrigger>
          <TabsTrigger value="periods">Period Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Spending</CardTitle>
              <CardDescription>Compare your budgeted amounts with actual spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  budgeted: { label: "Budgeted", color: "hsl(var(--chart-1))" },
                  spent: { label: "Spent", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="budgeted" fill="var(--color-budgeted)" name="Budgeted" />
                    <Bar dataKey="spent" fill="var(--color-spent)" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Variance</CardTitle>
              <CardDescription>Track how much you saved or overspent each month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  variance: { label: "Variance", color: "hsl(var(--chart-3))" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="variance"
                      stroke="var(--color-variance)"
                      fill="var(--color-variance)"
                      fillOpacity={0.3}
                      name="Variance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {categoryTrendData.slice(0, 4).map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>Budget vs spending trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      budgeted: { label: "Budgeted", color: category.color },
                      spent: { label: "Spent", color: `${category.color}80` },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={category.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="budgeted"
                          stroke={category.color}
                          strokeWidth={2}
                          name="Budgeted"
                        />
                        <Line
                          type="monotone"
                          dataKey="spent"
                          stroke={`${category.color}80`}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Spent"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <div className="space-y-4">
            {budgetHistory.map((period) => (
              <Card key={period.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{period.name}</CardTitle>
                      <CardDescription>
                        {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(period.status)}>{period.status}</Badge>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">${period.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          of ${period.totalBudget.toLocaleString()} budgeted
                        </div>
                        <div
                          className={`text-sm font-medium ${getVarianceColor(period.totalBudget - period.totalSpent)}`}
                        >
                          {period.totalBudget - period.totalSpent > 0 ? "+" : ""}$
                          {(period.totalBudget - period.totalSpent).toLocaleString()} variance
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {period.categories.map((category) => (
                      <div key={category.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{category.name}</h4>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Spent:</span>
                            <span className="font-medium">${category.spent}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Budget:</span>
                            <span>${category.budgeted}</span>
                          </div>
                          <div
                            className={`flex justify-between text-sm font-medium ${getVarianceColor(category.remaining)}`}
                          >
                            <span>Remaining:</span>
                            <span>${category.remaining}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
