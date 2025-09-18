"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, CheckCircle, DollarSign, Target, Lightbulb } from "lucide-react"

interface DebtAccount {
  id: string
  name: string
  type: string
  balance: number
  minimumPayment: number
  interestRate: number
  dueDate: string
}

interface RecurringExpense {
  id: string
  name: string
  amount: number
  frequency: string
  category: string
  isActive: boolean
  isSubscription: boolean
}

interface AIDebtAdvisorProps {
  debtAccounts: DebtAccount[]
  recurringExpenses: RecurringExpense[]
  selectedStrategy: "avalanche" | "snowball"
}

export function AIDebtAdvisor({ debtAccounts, recurringExpenses, selectedStrategy }: AIDebtAdvisorProps) {
  // Calculate AI recommendations
  const totalDebt = debtAccounts.reduce((sum, debt) => sum + debt.balance, 0)
  const highestInterestRate = Math.max(...debtAccounts.map((debt) => debt.interestRate))
  const lowestBalance = Math.min(...debtAccounts.map((debt) => debt.balance))

  const recommendations = [
    {
      id: "1",
      type: "optimization",
      priority: "high",
      title: "Switch to Debt Avalanche",
      description: `By focusing on your highest interest debt first (${highestInterestRate}% APR), you could save $1,247 in interest payments.`,
      impact: "$1,247 savings",
      timeframe: "4 months faster",
      icon: TrendingUp,
      color: "blue",
    },
    {
      id: "2",
      type: "payment",
      priority: "medium",
      title: "Increase Monthly Payment",
      description: "Adding just $100 to your monthly payments could reduce payoff time significantly.",
      impact: "$892 savings",
      timeframe: "8 months faster",
      icon: DollarSign,
      color: "green",
    },
    {
      id: "3",
      type: "consolidation",
      priority: "medium",
      title: "Consider Balance Transfer",
      description: "A 0% APR balance transfer could save money on high-interest credit card debt.",
      impact: "Up to $650 savings",
      timeframe: "12-18 months",
      icon: Target,
      color: "purple",
    },
    {
      id: "4",
      type: "subscription",
      priority: "low",
      title: "Subscription Optimization",
      description: "Review unused subscriptions to free up $15-30 monthly for debt payments.",
      impact: "$180-360/year",
      timeframe: "Immediate",
      icon: Lightbulb,
      color: "orange",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRecommendationColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200"
      case "green":
        return "bg-green-50 border-green-200"
      case "purple":
        return "bg-purple-50 border-purple-200"
      case "orange":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Debt Advisor
          <Badge variant="secondary" className="ml-2">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Strategy Analysis */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              Current Strategy: {selectedStrategy === "avalanche" ? "Debt Avalanche" : "Debt Snowball"}
            </h3>
            <Badge variant="outline">{selectedStrategy === "avalanche" ? "Interest-First" : "Balance-First"}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Estimated Payoff</span>
              <div className="font-medium">March 2027</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Interest</span>
              <div className="font-medium">$3,247</div>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Payment</span>
              <div className="font-medium">$515</div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Personalized Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const IconComponent = rec.icon
              return (
                <div key={rec.id} className={`p-4 border rounded-lg ${getRecommendationColor(rec.color)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{rec.title}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="font-medium text-green-600">{rec.impact}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeline: </span>
                      <span className="font-medium">{rec.timeframe}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button size="sm" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Apply Recommendations
          </Button>
          <Button variant="outline" size="sm">
            Get Detailed Plan
          </Button>
          <Button variant="ghost" size="sm">
            Customize Strategy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
