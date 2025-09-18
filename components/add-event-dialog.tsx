"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const [eventType, setEventType] = useState<string>("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState("")

  const handleSubmit = () => {
    // In real app, this would save to database
    console.log("Creating event:", {
      type: eventType,
      title,
      date,
      time,
      amount: amount ? Number(amount) : undefined,
      category,
      description,
      recurring: isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
    })

    // Reset form
    setEventType("")
    setTitle("")
    setDate("")
    setTime("")
    setAmount("")
    setCategory("")
    setDescription("")
    setIsRecurring(false)
    setRecurringPattern("")

    onOpenChange(false)
  }

  const getAmountLabel = () => {
    switch (eventType) {
      case "shift":
        return "Expected Earnings ($)"
      case "bill":
      case "subscription":
        return "Amount Due ($)"
      case "payday":
        return "Pay Amount ($)"
      case "payment":
        return "Payment Amount ($)"
      case "goal":
        return "Contribution Amount ($)"
      default:
        return "Amount ($)"
    }
  }

  const getCategoryOptions = () => {
    switch (eventType) {
      case "shift":
        return ["Regular", "Overtime", "Night Differential", "Weekend Premium", "Holiday Pay"]
      case "bill":
        return ["Housing", "Utilities", "Insurance", "Healthcare", "Transportation", "Other"]
      case "subscription":
        return ["Entertainment", "Software", "News", "Fitness", "Other"]
      case "payment":
        return ["Credit Card", "Loan", "Investment", "Savings", "Other"]
      case "goal":
        return ["Emergency Fund", "Retirement", "Vacation", "Purchase", "Debt Payoff"]
      default:
        return ["General"]
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Financial Event</DialogTitle>
          <DialogDescription>Add shifts, bills, paydays, or other financial events to your calendar</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shift">Work Shift</SelectItem>
                    <SelectItem value="bill">Bill Payment</SelectItem>
                    <SelectItem value="payday">Payday</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="goal">Savings Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="time">Time (Optional)</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">{getAmountLabel()}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions().map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details about this event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(!!checked)}
                />
                <Label htmlFor="recurring">This is a recurring event</Label>
              </div>

              {isRecurring && (
                <div>
                  <Label htmlFor="recurringPattern">Recurring Pattern</Label>
                  <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Quick Add Templates</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventType("shift")
                      setTitle("Regular Shift")
                      setCategory("Regular")
                      setAmount("200")
                    }}
                  >
                    Regular Shift
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventType("bill")
                      setTitle("Rent")
                      setCategory("Housing")
                      setIsRecurring(true)
                      setRecurringPattern("monthly")
                    }}
                  >
                    Monthly Rent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventType("payday")
                      setTitle("Bi-weekly Payday")
                      setIsRecurring(true)
                      setRecurringPattern("biweekly")
                    }}
                  >
                    Bi-weekly Pay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventType("goal")
                      setTitle("Emergency Fund")
                      setCategory("Emergency Fund")
                      setAmount("300")
                    }}
                  >
                    Savings Goal
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!eventType || !title || !date}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
