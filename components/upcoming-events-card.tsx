import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { CalendarEvent } from "@/app/calendar/page"

interface UpcomingEventsCardProps {
  events: CalendarEvent[]
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      const today = new Date()
      return eventDate >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const getEventIcon = (type: string) => {
    switch (type) {
      case "shift":
        return "💼"
      case "bill":
        return "📄"
      case "payday":
        return "💰"
      case "subscription":
        return "📱"
      case "goal":
        return "🎯"
      default:
        return "📅"
    }
  }

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
        <Calendar className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
        ) : (
          upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getEventIcon(event.type)}</span>
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {getDaysUntil(event.date)}
                    {event.time && ` at ${event.time}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {event.amount && (
                  <div className={`font-bold text-sm ${event.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {event.amount > 0 ? "+" : ""}${Math.abs(event.amount).toLocaleString()}
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
