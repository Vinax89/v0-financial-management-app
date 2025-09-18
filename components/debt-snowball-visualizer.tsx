"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingDown, Target, Calendar, DollarSign, ArrowRight, Snowflake, Flame } from "lucide-react"

interface DebtAccount {
  id: string
  name: string
  type: string
  balance: number
  minimumPayment: number
  interestRate: number
  dueDate: string
}

interface DebtSnowballVisualizerProps {
  debtAccounts: DebtAccount[]
  strategy: "avalanche" | "snowball"
}

export function DebtSnowballVisualizer({ debtAccounts, strategy }: DebtSnowballVisualizerProps) {
  // Sort debts based on strategy
  const sortedDebts = [...debtAccounts].sort((a, b) => {
    if (strategy === "avalanche") {
      return b.interestRate - a.interestRate // Highest interest first
    } else {
      return a.balance - b.balance // Lowest balance first
    }
  })

  const totalDebt = debtAccounts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimumPayments = debtAccounts.reduce((sum, debt) => sum + debt.minimumPayment, 0)

  // Calculate payoff timeline (simplified)
  const calculatePayoffMonths = (debt: DebtAccount, extraPayment = 0) => {
    const monthlyPayment = debt.minimumPayment + extraPayment
    const monthlyRate = debt.interestRate / 100 / 12

    if (monthlyRate === 0) {
      return Math.ceil(debt.balance / monthlyPayment)
    }

    const months = Math.log(1 + (debt.balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate)
    return Math.ceil(months)
  }

  const getDebtTypeColor = (type: string) => {
    switch (type) {
      case "credit_card":
        return "bg-red-500"
      case "student_loan":
        return "bg-blue-500"
      case "loan":
        return "bg-orange-500"
      case "mortgage":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStrategyIcon = () => {
    return strategy === "avalanche" ? <Flame className="h-5 w-5" /> : <Snowflake className="h-5 w-5" />
  }

  const getStrategyDescription = () => {
    return strategy === "avalanche"
      ? "Pay minimums on all debts, then attack the highest interest rate debt first"
      : "Pay minimums on all debts, then attack the smallest balance first for psychological wins"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStrategyIcon()}
          Debt {strategy === "avalanche" ? "Avalanche" : "Snowball"} Visualizer
        </CardTitle>
        <p className="text-sm text-muted-foreground">{getStrategyDescription()}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">${totalDebt.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Debt</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">${totalMinimumPayments}</div>
            <div className="text-sm text-muted-foreground">Min Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {calculatePayoffMonths(
                sortedDebts[0] || ({ balance: 0, minimumPayment: 0, interestRate: 0 } as DebtAccount),
              )}
            </div>
            <div className="text-sm text-muted-foreground">Months to First Payoff</div>
          </div>
        </div>

        {/* Debt Priority Order */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Payoff Priority Order
          </h3>

          {sortedDebts.map((debt, index) => {
            const progress = ((totalDebt - debt.balance) / totalDebt) * 100
            const payoffMonths = calculatePayoffMonths(debt)

            return (
              <div key={debt.id} className="relative">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getDebtTypeColor(debt.type)}`} />
                    <div>
                      <div className="font-medium">{debt.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {debt.type.replace("_", " ")} • {debt.interestRate}% APR
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mx-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Balance</span>
                      <span>${debt.balance.toLocaleString()}</span>
                    </div>
                    <Progress value={(debt.balance / totalDebt) * 100} className="h-2" />
                  </div>

                  <div className="text-right">
                    <div className="font-bold">${debt.balance.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">~{payoffMonths} months</div>
                    <Badge variant={index === 0 ? "default" : "outline"} className="mt-1">
                      {index === 0 ? "Focus Here" : `Priority ${index + 1}`}
                    </Badge>
                  </div>
                </div>

                {index < sortedDebts.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Strategy Benefits */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">
            {strategy === "avalanche" ? "Avalanche" : "Snowball"} Strategy Benefits
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            {strategy === "avalanche" ? (
              <>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  <span>Saves the most money in interest payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Mathematically optimal payoff timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3" />
                  <span>Reduces total debt burden fastest</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  <span>Quick wins build momentum and motivation</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3" />
                  <span>Reduces number of debts quickly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Psychological benefits of early victories</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Start This Strategy
          </Button>
          <Button variant="outline">Compare Strategies</Button>
          <Button variant="ghost">Customize Plan</Button>
        </div>
      </CardContent>
    </Card>
  )
}
