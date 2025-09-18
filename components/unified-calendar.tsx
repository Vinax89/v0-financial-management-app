"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: "bill" | "transaction" | "work" | "reminder" | "goal"
  startDate: Date
  endDate?: Date
  amount?: number
  status: "scheduled" | "completed" | "overdue" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  color: string
  category?: string
  account?: string
  isRecurring: boolean
  location?: string
  tags: string[]
}

const eventTypeColors = {
  bill: "#ef4444",
  transaction: "#10b981",
  work: "#3b82f6",
  reminder: "#f59e0b",
  goal: "#8b5cf6",
}

const statusColors = {
  scheduled: "#6b7280",
  completed: "#10b981",
  overdue: "#ef4444",
  cancelled: "#9ca3af",
}

const priorityColors = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
  urgent: "#dc2626",
}

export function UnifiedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Mock data - in real app, fetch from Supabase
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Rent Payment",
        description: "Monthly rent due",
        type: "bill",
        startDate: new Date(2024, 11, 1),
        amount: 1200,
        status: "scheduled",
        priority: "high",
        color: eventTypeColors.bill,
        category: "Housing",
        account: "Checking",
        isRecurring: true,
        tags: ["rent", "housing"],
      },
      {
        id: "2",
        title: "Salary Deposit",
        description: "Bi-weekly paycheck",
        type: "transaction",
        startDate: new Date(2024, 11, 15),
        amount: 2500,
        status: "scheduled",
        priority: "medium",
        color: eventTypeColors.transaction,
        category: "Income",
        account: "Checking",
        isRecurring: true,
        tags: ["salary", "income"],
      },
      {
        id: "3",
        title: "Work Shift",
        description: "9 AM - 5 PM",
        type: "work",
        startDate: new Date(2024, 11, 16, 9, 0),
        endDate: new Date(2024, 11, 16, 17, 0),
        status: "scheduled",
        priority: "medium",
        color: eventTypeColors.work,
        isRecurring: false,
        location: "Office",
        tags: ["work", "office"],
      },
      {
        id: "4",
        title: "Electric Bill Due",
        description: "Monthly electricity bill",
        type: "bill",
        startDate: new Date(2024, 11, 20),
        amount: 85,
        status: "scheduled",
        priority: "medium",
        color: eventTypeColors.bill,
        category: "Utilities",
        account: "Checking",
        isRecurring: true,
        tags: ["utilities", "electric"],
      },
      {
        id: "5",
        title: "Budget Review",
        description: "Monthly budget analysis",
        type: "reminder",
        startDate: new Date(2024, 11, 25),
        status: "scheduled",
        priority: "low",
        color: eventTypeColors.reminder,
        isRecurring: true,
        tags: ["budget", "review"],
      },
    ]
    setEvents(mockEvents)
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const typeMatch = filterType === "all" || event.type === filterType
      const statusMatch = filterStatus === "all" || event.status === filterStatus
      return typeMatch && statusMatch
    })
  }, [events, filterType, filterStatus])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.startDate, date))
  }

  const getTotalAmountForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    return dayEvents.reduce((total, event) => {
      if (event.amount) {
        return total + (event.type === "transaction" && event.amount > 0 ? event.amount : -(event.amount || 0))
      }
      return total
    }, 0)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const EventCard = ({ event }: { event: CalendarEvent }) => (
    <div
      className={cn(
        "p-2 rounded-md text-xs border-l-4 bg-card hover:bg-accent transition-colors cursor-pointer",
        `border-l-[${event.color}]`,
      )}
      style={{ borderLeftColor: event.color }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{event.title}</span>
        {event.amount && (
          <span className={cn("font-bold", event.type === "transaction" ? "text-green-600" : "text-red-600")}>
            ${Math.abs(event.amount).toFixed(0)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1">
        <Badge variant="outline" className="text-xs px-1 py-0">
          {event.type}
        </Badge>
        <Badge
          variant="outline"
          className="text-xs px-1 py-0"
          style={{ color: statusColors[event.status], borderColor: statusColors[event.status] }}
        >
          {event.status}
        </Badge>
        {event.priority === "high" || event.priority === "urgent" ? (
          <AlertCircle className="h-3 w-3 text-red-500" />
        ) : null}
      </div>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Financial Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bill">Bills</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="goal">Goals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "month" | "week" | "day")}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>

          <TabsContent value="month">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day)
                const totalAmount = getTotalAmountForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[120px] p-1 border rounded-lg cursor-pointer hover:bg-accent transition-colors",
                      !isCurrentMonth && "text-muted-foreground bg-muted/30",
                      isSelected && "ring-2 ring-primary",
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-sm font-medium", !isCurrentMonth && "text-muted-foreground")}>
                        {format(day, "d")}
                      </span>
                      {totalAmount !== 0 && (
                        <span
                          className={cn(
                            "text-xs font-bold px-1 rounded",
                            totalAmount > 0 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100",
                          )}
                        >
                          {totalAmount > 0 ? "+" : ""}${totalAmount.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: `${event.color}20`, color: event.color }}
                        >
                          {event.title}
                          {event.amount && <span className="ml-1 font-bold">${event.amount.toFixed(0)}</span>}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="text-center text-muted-foreground">Week view coming soon...</div>
          </TabsContent>

          <TabsContent value="day">
            <div className="text-center text-muted-foreground">Day view coming soon...</div>
          </TabsContent>
        </Tabs>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events for {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-muted-foreground text-sm">No events scheduled for this date.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
