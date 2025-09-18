"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle, Target } from "lucide-react"
import { format, addDays } from "date-fns"

interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  upcomingBills: number
  overdueItems: number
  workHoursScheduled: number
  budgetUtilization: number
}

interface UpcomingEvent {
  id: string
  title: string
  date: Date
  amount?: number
  type: "bill" | "income" | "work"
  status: "scheduled" | "overdue"
  priority: "low" | "medium" | "high" | "urgent"
}

export function FinancialOverviewDashboard() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    upcomingBills: 0,
    overdueItems: 0,
    workHoursScheduled: 0,
    budgetUtilization: 0,
  })

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [timeframe, setTimeframe] = useState<"week" | "month">("week")

  const generateMockData = useCallback(() => {
    const mockSummary = {
      totalIncome: 5200,
      totalExpenses: 3850,
      netCashFlow: 1350,
      upcomingBills: 4,
      overdueItems: 1,
      workHoursScheduled: 40,
      budgetUtilization: 78,
    }

    const mockEvents = [
      {
        id: "1",
        title: "Rent Payment",
        date: addDays(new Date(), 2),
        amount: 1200,
        type: "bill" as const,
        status: "scheduled" as const,
        priority: "high" as const,
      },
      {
        id: "2",
        title: "Salary Deposit",
        date: addDays(new Date(), 5),
        amount: 2500,
        type: "income" as const,
        status: "scheduled" as const,
        priority: "medium" as const,
      },
      {
        id: "3",
        title: "Electric Bill",
        date: addDays(new Date(), -1),
        amount: 85,
        type: "bill" as const,
        status: "overdue" as const,
        priority: "urgent" as const,
      },
      {
        id: "4",
        title: "Work Shift",
        date: addDays(new Date(), 1),
        type: "work" as const,
        status: "scheduled" as const,
        priority: "medium" as const,
      },
    ]

    return { mockSummary, mockEvents }
  }, [])

  useEffect(() => {
    const { mockSummary, mockEvents } = generateMockData()
    setSummary(mockSummary)
    setUpcomingEvents(mockEvents)
  }, [timeframe, generateMockData])

  const getStatusColor = useCallback((status: string, priority: string) => {
    if (status === "overdue") return "destructive"
    if (priority === "urgent" || priority === "high") return "destructive"
    return "secondary"
  }, [])

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "bill":
        return <AlertTriangle className="h-4 w-4" />
      case "income":
        return <TrendingUp className="h-4 w-4" />
      case "work":
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }, [])

  const handleTimeframeChange = useCallback((value: string) => {
    setTimeframe(value as "week" | "month")
  }, [])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            {summary.netCashFlow >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${Math.abs(summary.netCashFlow).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Income: ${summary.totalIncome.toLocaleString()} | Expenses: ${summary.totalExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.upcomingBills}</div>
            <p className="text-xs text-muted-foreground">
              {summary.overdueItems > 0 && (
                <span className="text-red-600 font-medium">{summary.overdueItems} overdue</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.workHoursScheduled}h</div>
            <p className="text-xs text-muted-foreground">This {timeframe}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.budgetUtilization}%</div>
            <Progress value={summary.budgetUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {summary.budgetUtilization > 90 ? "Over budget" : "On track"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Bills, income, and work schedule for the next {timeframe}</CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={handleTimeframeChange}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getTypeIcon(event.type)}
                  </div>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{format(event.date, "MMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {event.amount && (
                    <span className={`font-bold ${event.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {event.type === "income" ? "+" : "-"}${event.amount.toLocaleString()}
                    </span>
                  )}
                  <Badge variant={getStatusColor(event.status, event.priority)}>
                    {event.status === "overdue" ? "Overdue" : event.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
