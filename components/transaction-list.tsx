import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit3, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  subcategory?: string
  account: string
  type: "income" | "expense"
  isRecurring: boolean
  confidence?: number
  needsReview?: boolean
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500"
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceIcon = (confidence?: number, needsReview?: boolean) => {
    if (needsReview) return <AlertCircle className="w-4 h-4 text-orange-600" />
    if (!confidence) return <Clock className="w-4 h-4 text-gray-500" />
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4 text-green-600" />
    return <AlertCircle className="w-4 h-4 text-yellow-600" />
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or import some transactions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.description}</span>
                    {transaction.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                    {getConfidenceIcon(transaction.confidence, transaction.needsReview)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)}</span>
                    <span>•</span>
                    <span>{transaction.account}</span>
                    {transaction.subcategory && (
                      <>
                        <span>•</span>
                        <span>{transaction.subcategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Badge
                      variant={transaction.category === "Uncategorized" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {transaction.category}
                    </Badge>
                    {transaction.confidence && (
                      <span className={`text-xs ${getConfidenceColor(transaction.confidence)}`}>
                        {Math.round(transaction.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
