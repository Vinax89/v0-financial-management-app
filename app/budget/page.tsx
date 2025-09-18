"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { BudgetCategoryCard } from "@/components/budget-category-card"
import { CreateBudgetDialog } from "@/components/create-budget-dialog"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
  type: "need" | "want" | "save"
}

interface Budget {
  id: string
  name: string
  period: "weekly" | "biweekly" | "semimonthly" | "monthly"
  totalIncome: number
  categories: BudgetCategory[]
  startDate: string
  endDate: string
}

export default function BudgetPage() {
  const [selectedBudget, setSelectedBudget] = useState<string>("current")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Mock data - in real app this would come from database
  const budgets: Budget[] = [
    {
      id: "current",
      name: "Current Pay Period",
      period: "biweekly",
      totalIncome: 2400,
      startDate: "2024-01-01",
      endDate: "2024-01-14",
      categories: [
        { id: "1", name: "Housing", allocated: 800, spent: 750, color: "bg-chart-1", type: "need" },
        { id: "2", name: "Food & Groceries", allocated: 400, spent: 320, color: "bg-chart-2", type: "need" },
        { id: "3", name: "Transportation", allocated: 300, spent: 280, color: "bg-chart-3", type: "need" },
        { id: "4", name: "Utilities", allocated: 200, spent: 185, color: "bg-chart-4", type: "need" },
        { id: "5", name: "Entertainment", allocated: 150, spent: 95, color: "bg-chart-5", type: "want" },
        { id: "6", name: "Emergency Fund", allocated: 300, spent: 0, color: "bg-primary", type: "save" },
        { id: "7", name: "Retirement", allocated: 250, spent: 0, color: "bg-secondary", type: "save" },
      ],
    },
  ]

  const currentBudget = budgets.find((b) => b.id === selectedBudget) || budgets[0]
  const totalAllocated = currentBudget.categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = currentBudget.categories.reduce((sum, cat) => sum + cat.spent, 0)
  const remaining = currentBudget.totalIncome - totalSpent
  const allocationProgress = (totalAllocated / currentBudget.totalIncome) * 100

  const categoryTypes = {
    need: currentBudget.categories.filter((cat) => cat.type === "need"),
    want: currentBudget.categories.filter((cat) => cat.type === "want"),
    save: currentBudget.categories.filter((cat) => cat.type === "save"),
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Paycheck-aligned budgeting for shift workers</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Pay Period</SelectItem>
                <SelectItem value="next">Next Pay Period</SelectItem>
                <SelectItem value="previous">Previous Pay Period</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Budget
            </Button>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentBudget.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This pay period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / currentBudget.totalIncome) * 100).toFixed(1)}% of income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${Math.abs(remaining).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{remaining >= 0 ? "Available" : "Over budget"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allocationProgress.toFixed(1)}%</div>
              <Progress value={allocationProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">${totalAllocated.toLocaleString()} allocated</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="needs">
              Needs{" "}
              <Badge variant="secondary" className="ml-1">
                {categoryTypes.need.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="wants">
              Wants{" "}
              <Badge variant="secondary" className="ml-1">
                {categoryTypes.want.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="savings">
              Savings{" "}
              <Badge variant="secondary" className="ml-1">
                {categoryTypes.save.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentBudget.categories.map((category) => (
                <BudgetCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="needs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTypes.need.map((category) => (
                <BudgetCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wants" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTypes.want.map((category) => (
                <BudgetCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTypes.save.map((category) => (
                <BudgetCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <CreateBudgetDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </div>
    </div>
  )
}
