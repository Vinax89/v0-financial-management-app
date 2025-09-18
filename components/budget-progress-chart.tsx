"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BudgetProgressChart() {
  const budgetData = [
    { category: "Housing", budgeted: 1200, spent: 1200, color: "#3b82f6" },
    { category: "Food & Groceries", budgeted: 500, spent: 450, color: "#10b981" },
    { category: "Transportation", budgeted: 400, spent: 380, color: "#f59e0b" },
    { category: "Utilities", budgeted: 250, spent: 220, color: "#8b5cf6" },
    { category: "Entertainment", budgeted: 200, spent: 180, color: "#ec4899" },
    { category: "Healthcare", budgeted: 200, spent: 150, color: "#06b6d4" },
    { category: "Shopping", budgeted: 300, spent: 320, color: "#ef4444" },
  ]

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Budget Performance</CardTitle>
        <p className="text-sm text-gray-600">Track spending against your budget goals</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetData.map((item) => {
          const percentage = (item.spent / item.budgeted) * 100
          const isOverBudget = item.spent > item.budgeted
          const remaining = item.budgeted - item.spent

          return (
            <div
              key={item.category}
              className="space-y-3 p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-colors border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-lg font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
                      ${item.spent.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">of ${item.budgeted.toLocaleString()}</span>
                  </div>
                  <p className={`text-xs font-medium ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>
                    {isOverBudget
                      ? `$${Math.abs(remaining).toLocaleString()} over budget`
                      : `$${remaining.toLocaleString()} remaining`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? "bg-gradient-to-r from-red-400 to-red-600"
                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                  {isOverBudget && (
                    <div
                      className="h-full bg-red-200 opacity-50"
                      style={{ width: `${Math.min(percentage - 100, 20)}%` }}
                    />
                  )}
                </div>
                <span className={`text-sm font-bold min-w-12 ${isOverBudget ? "text-red-600" : "text-gray-700"}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${budgetData.reduce((sum, item) => sum + item.budgeted, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${budgetData.reduce((sum, item) => sum + item.spent, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Total Spent</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  budgetData.some((item) => item.spent > item.budgeted) ? "text-red-600" : "text-emerald-600"
                }`}
              >
                ${Math.abs(budgetData.reduce((sum, item) => sum + (item.budgeted - item.spent), 0)).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                {budgetData.reduce((sum, item) => sum + (item.budgeted - item.spent), 0) >= 0
                  ? "Remaining"
                  : "Over Budget"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
