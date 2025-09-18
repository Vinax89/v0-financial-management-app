"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"

interface CreateBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BudgetCategory {
  name: string
  allocated: number
  type: "need" | "want" | "save"
}

export function CreateBudgetDialog({ open, onOpenChange }: CreateBudgetDialogProps) {
  const [budgetName, setBudgetName] = useState("")
  const [period, setPeriod] = useState<string>("")
  const [totalIncome, setTotalIncome] = useState("")
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: "Housing", allocated: 0, type: "need" },
    { name: "Food & Groceries", allocated: 0, type: "need" },
    { name: "Transportation", allocated: 0, type: "need" },
  ])

  const addCategory = () => {
    setCategories([...categories, { name: "", allocated: 0, type: "need" }])
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, field: keyof BudgetCategory, value: string | number) => {
    const updated = [...categories]
    updated[index] = { ...updated[index], [field]: value }
    setCategories(updated)
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const remainingIncome = Number(totalIncome) - totalAllocated

  const handleSubmit = () => {
    // In real app, this would save to database
    console.log("Creating budget:", {
      name: budgetName,
      period,
      totalIncome: Number(totalIncome),
      categories,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Budget</DialogTitle>
          <DialogDescription>Set up a budget aligned with your pay schedule</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input
                id="budgetName"
                placeholder="January 2024 Budget"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period">Pay Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="totalIncome">Expected Income ($)</Label>
            <Input
              id="totalIncome"
              type="number"
              placeholder="2400"
              value={totalIncome}
              onChange={(e) => setTotalIncome(e.target.value)}
            />
          </div>

          {/* Budget Summary */}
          {totalIncome && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-xl font-bold">${Number(totalIncome).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated</p>
                    <p className="text-xl font-bold">${totalAllocated.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`text-xl font-bold ${remainingIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${Math.abs(remainingIncome).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Budget Categories</Label>
              <Button variant="outline" size="sm" onClick={addCategory}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`category-${index}`}>Category Name</Label>
                    <Input
                      id={`category-${index}`}
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) => updateCategory(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`amount-${index}`}>Amount ($)</Label>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      placeholder="0"
                      value={category.allocated || ""}
                      onChange={(e) => updateCategory(index, "allocated", Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`type-${index}`}>Type</Label>
                    <Select
                      value={category.type}
                      onValueChange={(value) => updateCategory(index, "type", value as "need" | "want" | "save")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="need">Need</SelectItem>
                        <SelectItem value="want">Want</SelectItem>
                        <SelectItem value="save">Save</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCategory(index)}
                    disabled={categories.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!budgetName || !period || !totalIncome || categories.some((cat) => !cat.name)}
          >
            Create Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
