import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Calendar, DollarSign, Plus } from "lucide-react"

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: "emergency" | "retirement" | "vacation" | "purchase" | "debt"
}

export function FinancialGoalsCard() {
  const goals: FinancialGoal[] = [
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 15000,
      currentAmount: 8500,
      targetDate: "2024-12-31",
      category: "emergency",
    },
    {
      id: "2",
      name: "Retirement Savings",
      targetAmount: 50000,
      currentAmount: 23000,
      targetDate: "2025-12-31",
      category: "retirement",
    },
    {
      id: "3",
      name: "Vacation Fund",
      targetAmount: 5000,
      currentAmount: 2800,
      targetDate: "2024-08-15",
      category: "vacation",
    },
    {
      id: "4",
      name: "New Car",
      targetAmount: 25000,
      currentAmount: 12000,
      targetDate: "2025-06-30",
      category: "purchase",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "retirement":
        return "bg-blue-100 text-blue-800"
      case "vacation":
        return "bg-green-100 text-green-800"
      case "purchase":
        return "bg-purple-100 text-purple-800"
      case "debt":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emergency":
        return "🚨"
      case "retirement":
        return "🏖️"
      case "vacation":
        return "✈️"
      case "purchase":
        return "🚗"
      case "debt":
        return "💳"
      default:
        return "🎯"
    }
  }

  const getTimeRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`
    return `${Math.ceil(diffDays / 365)} years`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Financial Goals</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          const remaining = goal.targetAmount - goal.currentAmount

          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className={getCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">${goal.currentAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Target</div>
                    <div className="font-medium">${goal.targetAmount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{getTimeRemaining(goal.targetDate)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Remaining: </span>
                    <span className="font-medium">${remaining.toLocaleString()}</span>
                  </div>
                </div>

                {progress >= 100 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-800 font-medium">Goal Achieved! 🎉</p>
                    </div>
                  </div>
                )}

                {progress < 100 && (
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-sm text-muted-foreground">
                      Save $
                      {Math.ceil(
                        remaining /
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30),
                            ),
                          ),
                      )}{" "}
                      per month to reach your goal
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
