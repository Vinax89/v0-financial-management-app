"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, DollarSign, Plus, Edit, Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react"

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

interface RecurringBillsManagerProps {
  expenses: RecurringExpense[]
}

export function RecurringBillsManager({ expenses }: RecurringBillsManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "Utilities", "Insurance", "Housing", "Transportation", "Healthcare", "Other"]

  const filteredExpenses =
    selectedCategory === "all" ? expenses : expenses.filter((expense) => expense.category === selectedCategory)

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return "text-red-600"
    if (daysUntil <= 3) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = (daysUntil: number) => {
    if (daysUntil < 0) return <AlertCircle className="h-4 w-4 text-red-600" />
    if (daysUntil <= 3) return <Clock className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const totalMonthlyBills = expenses
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recurring Bills Manager
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Recurring Bill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-name">Bill Name</Label>
                    <Input id="bill-name" placeholder="Electric Bill" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="amount" type="number" placeholder="85.00" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Monthly" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Next Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Add Bill</Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">${totalMonthlyBills.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Monthly Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{expenses.filter((e) => e.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{expenses.filter((e) => getDaysUntilDue(e.nextDue) <= 7).length}</div>
              <div className="text-sm text-muted-foreground">Due This Week</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const daysUntil = getDaysUntilDue(expense.nextDue)
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(daysUntil)}
                    <div>
                      <div className="font-medium">{expense.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.category} • {expense.frequency}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">${expense.amount.toFixed(2)}</div>
                      <div className={`text-sm ${getStatusColor(daysUntil)}`}>
                        {daysUntil < 0
                          ? `${Math.abs(daysUntil)} days overdue`
                          : daysUntil === 0
                            ? "Due today"
                            : `Due in ${daysUntil} days`}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found for the selected category.</p>
              <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setShowAddDialog(true)}>
                Add Your First Bill
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
