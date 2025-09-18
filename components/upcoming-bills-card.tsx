import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle } from "lucide-react"

interface UpcomingBill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  isPaid: boolean
  isOverdue: boolean
}

export function UpcomingBillsCard() {
  const upcomingBills: UpcomingBill[] = [
    {
      id: "1",
      name: "Rent",
      amount: 1200,
      dueDate: "2024-01-31",
      category: "Housing",
      isPaid: false,
      isOverdue: false,
    },
    {
      id: "2",
      name: "Electric Bill",
      amount: 85,
      dueDate: "2024-01-28",
      category: "Utilities",
      isPaid: false,
      isOverdue: false,
    },
    {
      id: "3",
      name: "Credit Card",
      amount: 245,
      dueDate: "2024-01-25",
      category: "Credit",
      isPaid: false,
      isOverdue: true,
    },
    {
      id: "4",
      name: "Internet",
      amount: 65,
      dueDate: "2024-02-01",
      category: "Utilities",
      isPaid: true,
      isOverdue: false,
    },
  ]

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Upcoming Bills</CardTitle>
        <Button variant="ghost" size="sm">
          <Calendar className="w-4 h-4 mr-1" />
          View Calendar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingBills.map((bill) => {
          const daysUntilDue = getDaysUntilDue(bill.dueDate)

          return (
            <div key={bill.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bill.name}</span>
                  {bill.isOverdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Due {new Date(bill.dueDate).toLocaleDateString()}</span>
                  <Badge
                    variant={
                      bill.isPaid
                        ? "default"
                        : bill.isOverdue
                          ? "destructive"
                          : daysUntilDue <= 3
                            ? "secondary"
                            : "outline"
                    }
                    className="text-xs"
                  >
                    {bill.isPaid
                      ? "Paid"
                      : bill.isOverdue
                        ? "Overdue"
                        : daysUntilDue <= 0
                          ? "Due Today"
                          : `${daysUntilDue} days`}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${bill.isPaid ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  ${bill.amount.toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
