"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { CalendarGrid } from "@/components/calendar-grid"
import { AddEventDialog } from "@/components/add-event-dialog"
import { EventFilters } from "@/components/event-filters"
import { UpcomingEventsCard } from "@/components/upcoming-events-card"
import { ShiftSummaryCard } from "@/components/shift-summary-card"

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  type: "shift" | "bill" | "payday" | "payment" | "subscription" | "goal"
  amount?: number
  status: "scheduled" | "completed" | "overdue" | "cancelled"
  category?: string
  recurring?: boolean
  description?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<"month" | "week" | "day">("month")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Mock data - in real app this would come from database
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Morning Shift",
      date: "2024-01-15",
      time: "06:00",
      type: "shift",
      amount: 200,
      status: "scheduled",
      category: "Regular",
      description: "6AM - 2PM shift",
    },
    {
      id: "2",
      title: "Rent Payment",
      date: "2024-01-31",
      type: "bill",
      amount: -1200,
      status: "scheduled",
      category: "Housing",
      recurring: true,
    },
    {
      id: "3",
      title: "Bi-weekly Payday",
      date: "2024-01-14",
      type: "payday",
      amount: 1200,
      status: "completed",
      recurring: true,
    },
    {
      id: "4",
      title: "Electric Bill",
      date: "2024-01-28",
      type: "bill",
      amount: -85,
      status: "scheduled",
      category: "Utilities",
      recurring: true,
    },
    {
      id: "5",
      title: "Night Shift",
      date: "2024-01-16",
      time: "22:00",
      type: "shift",
      amount: 240,
      status: "scheduled",
      category: "Night Differential",
      description: "10PM - 6AM shift with differential",
    },
    {
      id: "6",
      title: "Netflix Subscription",
      date: "2024-01-12",
      type: "subscription",
      amount: -15.99,
      status: "completed",
      category: "Entertainment",
      recurring: true,
    },
    {
      id: "7",
      title: "Emergency Fund Goal",
      date: "2024-01-30",
      type: "goal",
      amount: -300,
      status: "scheduled",
      category: "Savings",
      description: "Monthly contribution to emergency fund",
    },
  ]

  const filteredEvents =
    selectedFilters.length > 0 ? events.filter((event) => selectedFilters.includes(event.type)) : events

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Financial Calendar</h1>
            <p className="text-muted-foreground">Centralized view of shifts, bills, paydays, and financial events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-heading font-semibold min-w-48 text-center">{getMonthName(currentDate)}</h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EventFilters selectedFilters={selectedFilters} onFiltersChange={setSelectedFilters} />
            <Select value={selectedView} onValueChange={(value: "month" | "week" | "day") => setSelectedView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <CalendarGrid currentDate={currentDate} events={filteredEvents} view={selectedView} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ShiftSummaryCard events={events} currentDate={currentDate} />
            <UpcomingEventsCard events={events} />
          </div>
        </div>

        {/* Event Details Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="paydays">Paydays</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Next 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter((event) => {
                      const eventDate = new Date(event.date)
                      const today = new Date()
                      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return eventDate >= today && eventDate <= nextWeek
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              event.type === "shift"
                                ? "bg-blue-500"
                                : event.type === "bill"
                                  ? "bg-red-500"
                                  : event.type === "payday"
                                    ? "bg-green-500"
                                    : event.type === "subscription"
                                      ? "bg-purple-500"
                                      : "bg-orange-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                              {event.time && ` at ${event.time}`}
                            </div>
                          </div>
                        </div>
                        {event.amount && (
                          <div className={`font-bold ${event.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {event.amount > 0 ? "+" : ""}${Math.abs(event.amount).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shift Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter((event) => event.type === "shift")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                            {event.time && ` at ${event.time}`}
                          </div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">{event.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">+${event.amount?.toLocaleString()}</div>
                          <Badge variant={event.category === "Night Differential" ? "secondary" : "outline"}>
                            {event.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bill Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter((event) => event.type === "bill" || event.type === "subscription")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Due {new Date(event.date).toLocaleDateString()}
                          </div>
                          {event.recurring && (
                            <Badge variant="outline" className="mt-1">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">${Math.abs(event.amount || 0).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{event.category}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paydays" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payday Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter((event) => event.type === "payday")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <Badge variant="default" className="mt-1">
                            {event.status === "completed" ? "Received" : "Scheduled"}
                          </Badge>
                        </div>
                        <div className="font-bold text-green-600">+${event.amount?.toLocaleString()}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddEventDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
    </div>
  )
}
