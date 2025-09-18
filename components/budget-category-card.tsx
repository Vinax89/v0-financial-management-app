import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2 } from "lucide-react"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
  type: "need" | "want" | "save"
}

interface BudgetCategoryCardProps {
  category: BudgetCategory
}

export function BudgetCategoryCard({ category }: BudgetCategoryCardProps) {
  const spentPercentage = (category.spent / category.allocated) * 100
  const remaining = category.allocated - category.spent
  const isOverBudget = category.spent > category.allocated

  const getTypeColor = (type: string) => {
    switch (type) {
      case "need":
        return "bg-red-100 text-red-800"
      case "want":
        return "bg-blue-100 text-blue-800"
      case "save":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "need":
        return "Need"
      case "want":
        return "Want"
      case "save":
        return "Savings"
      default:
        return "Other"
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${category.color}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
          <Badge variant="secondary" className={getTypeColor(category.type)}>
            {getTypeLabel(category.type)}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${category.spent.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">of ${category.allocated.toLocaleString()}</span>
        </div>

        <Progress
          value={Math.min(spentPercentage, 100)}
          className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
        />

        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            {remaining >= 0 ? `$${remaining.toLocaleString()} left` : `$${Math.abs(remaining).toLocaleString()} over`}
          </span>
          <span className="text-muted-foreground">{spentPercentage.toFixed(1)}%</span>
        </div>

        {isOverBudget && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-xs text-red-800">Over budget by ${Math.abs(remaining).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
