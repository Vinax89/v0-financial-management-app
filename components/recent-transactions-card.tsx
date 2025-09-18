import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: "income" | "expense"
}

export function RecentTransactionsCard() {
  const recentTransactions: Transaction[] = [
    {
      id: "1",
      description: "Grocery Store",
      amount: -85.32,
      category: "Food & Groceries",
      date: "2024-01-15",
      type: "expense",
    },
    {
      id: "2",
      description: "Paycheck Deposit",
      amount: 1200.0,
      category: "Income",
      date: "2024-01-14",
      type: "income",
    },
    {
      id: "3",
      description: "Gas Station",
      amount: -45.67,
      category: "Transportation",
      date: "2024-01-13",
      type: "expense",
    },
    {
      id: "4",
      description: "Netflix",
      amount: -15.99,
      category: "Entertainment",
      date: "2024-01-12",
      type: "expense",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{transaction.description}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                <Badge variant="outline" className="text-xs">
                  {transaction.category}
                </Badge>
              </div>
            </div>
            <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
