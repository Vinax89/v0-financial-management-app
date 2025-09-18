"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react"

interface Insight {
  id: string
  type: "opportunity" | "warning" | "achievement" | "prediction"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionable: boolean
  category: string
  value?: number
  trend?: "up" | "down" | "stable"
}

export function AIFinancialInsights() {
  const insights: Insight[] = [
    {
      id: "1",
      type: "opportunity",
      title: "Optimize Subscription Spending",
      description: "You have 3 unused subscriptions costing $47/month. Canceling them could save $564 annually.",
      impact: "high",
      actionable: true,
      category: "Subscriptions",
      value: 564,
      trend: "down",
    },
    {
      id: "2",
      type: "warning",
      title: "Dining Out Trend Alert",
      description: "Your dining expenses increased 34% this month. Consider meal planning to stay within budget.",
      impact: "medium",
      actionable: true,
      category: "Food & Dining",
      value: 34,
      trend: "up",
    },
    {
      id: "3",
      type: "achievement",
      title: "Savings Goal Progress",
      description: "Excellent! You're 23% ahead of schedule on your emergency fund goal.",
      impact: "high",
      actionable: false,
      category: "Savings",
      value: 23,
      trend: "up",
    },
    {
      id: "4",
      type: "prediction",
      title: "Cash Flow Forecast",
      description: "Based on current trends, you'll have $1,340 surplus next month - perfect for extra savings.",
      impact: "medium",
      actionable: true,
      category: "Cash Flow",
      value: 1340,
      trend: "up",
    },
    {
      id: "5",
      type: "opportunity",
      title: "Investment Opportunity",
      description:
        "Your cash reserves are high. Consider investing $2,000 in your retirement account for tax benefits.",
      impact: "high",
      actionable: true,
      category: "Investment",
      value: 2000,
      trend: "stable",
    },
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "achievement":
        return <Target className="w-5 h-5 text-green-600" />
      case "prediction":
        return <Brain className="w-5 h-5 text-blue-600" />
      default:
        return <Brain className="w-5 h-5 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "border-l-yellow-500 bg-yellow-50/50"
      case "warning":
        return "border-l-red-500 bg-red-50/50"
      case "achievement":
        return "border-l-green-500 bg-green-50/50"
      case "prediction":
        return "border-l-blue-500 bg-blue-50/50"
      default:
        return "border-l-gray-500 bg-gray-50/50"
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Impact</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Impact</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">AI Financial Insights</CardTitle>
              <p className="text-sm text-gray-600">Personalized recommendations based on your spending patterns</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary">{insights.length} insights</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className={`border-l-4 ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {insight.trend && getTrendIcon(insight.trend)}
                  {getImpactBadge(insight.impact)}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{insight.description}</p>

              {insight.value && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-lg">
                    {insight.type === "opportunity" && insight.value > 100 ? "+" : ""}${insight.value.toLocaleString()}
                    {insight.type === "warning" && insight.value < 100 ? "%" : ""}
                  </span>
                  {insight.type === "warning" && insight.value < 100 && (
                    <span className="text-sm text-gray-500">increase</span>
                  )}
                </div>
              )}

              {insight.actionable && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Recommended action available</span>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Take Action
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Weekly Financial Review</h4>
                  <p className="text-sm text-gray-600">Get personalized insights every Monday</p>
                </div>
              </div>
              <Button size="sm">Schedule Review</Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
