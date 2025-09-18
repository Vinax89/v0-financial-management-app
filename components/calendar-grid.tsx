"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { CalendarEvent } from "@/app/calendar/page"

interface CalendarGridProps {
  currentDate: Date
  events: CalendarEvent[]
  view: "month" | "week" | "day"
}

export function CalendarGrid({ currentDate, events, view }: CalendarGridProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day: number | null) => {
    if (!day) return []

    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]

    return events.filter((event) => event.date === dateStr)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "shift":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "bill":
        return "bg-red-100 text-red-800 border-red-200"
      case "payday":
        return "bg-green-100 text-green-800 border-green-200"
      case "subscription":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "goal":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (view === "month") {
    return (
      <Card>
        <CardContent className="p-0">
          {/* Header with day names */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day)

              return (
                <div
                  key={index}
                  className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
                    day ? "bg-background" : "bg-muted/30"
                  } ${isToday(day) ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday(day) ? "text-primary font-bold" : ""}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventColor(event.type)} truncate`}
                            title={event.title}
                          >
                            {event.time && <span className="font-medium">{event.time} </span>}
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Week and day views would be implemented similarly
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          {view.charAt(0).toUpperCase() + view.slice(1)} view coming soon
        </div>
      </CardContent>
    </Card>
  )
}
