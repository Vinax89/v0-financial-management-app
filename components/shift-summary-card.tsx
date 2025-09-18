import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, DollarSign, Calendar } from "lucide-react"
import type { CalendarEvent } from "@/app/calendar/page"

interface ShiftSummaryCardProps {
  events: CalendarEvent[]
  currentDate: Date
}

export function ShiftSummaryCard({ events, currentDate }: ShiftSummaryCardProps) {
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthlyShifts = events.filter((event) => {
    if (event.type !== "shift") return false
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })

  const totalShifts = monthlyShifts.length
  const completedShifts = monthlyShifts.filter((shift) => shift.status === "completed").length
  const totalEarnings = monthlyShifts.reduce((sum, shift) => sum + (shift.amount || 0), 0)
  const completedEarnings = monthlyShifts
    .filter((shift) => shift.status === "completed")
    .reduce((sum, shift) => sum + (shift.amount || 0), 0)

  const completionRate = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0
  const earningsRate = totalEarnings > 0 ? (completedEarnings / totalEarnings) * 100 : 0

  const upcomingShifts = monthlyShifts.filter((shift) => {
    const shiftDate = new Date(shift.date)
    const today = new Date()
    return shiftDate >= today && shift.status === "scheduled"
  }).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Shift Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{completedShifts}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{upcomingShifts}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Shift Progress</span>
            <span className="text-sm">
              {completedShifts}/{totalShifts}
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Earnings</span>
            </div>
            <span className="text-sm font-bold text-green-600">${completedEarnings.toLocaleString()}</span>
          </div>
          <Progress value={earningsRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            ${(totalEarnings - completedEarnings).toLocaleString()} remaining potential
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Total shifts scheduled: {totalShifts}</div>
            <div>Average per shift: ${totalShifts > 0 ? (totalEarnings / totalShifts).toFixed(0) : 0}</div>
            <div>Projected monthly: ${totalEarnings.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
