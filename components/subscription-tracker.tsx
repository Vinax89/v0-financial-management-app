"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Pause,
  Play,
} from "lucide-react"

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
  category: string
  nextDue: string
  isActive: boolean
  isSubscription: boolean
  lastUsed?: string
  usageScore?: number
  annualSavings?: number
}

interface SubscriptionTrackerProps {
  subscriptions: Subscription[]
}

export function SubscriptionTracker({ subscriptions }: SubscriptionTrackerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showInactive, setShowInactive] = useState(false)

  const categories = ["all", "Entertainment", "Productivity", "News", "Fitness", "Music", "Other"]

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const categoryMatch = selectedCategory === "all" || sub.category === selectedCategory
    const activeMatch = showInactive || sub.isActive
    return categoryMatch && activeMatch
  })

  const totalMonthlySpend = subscriptions
    .filter((sub) => sub.isActive)
    .reduce((sum, sub) => {
      const multiplier =
        sub.frequency === "weekly"
          ? 4.33
          : sub.frequency === "quarterly"
            ? 0.33
            : sub.frequency === "yearly"
              ? 0.083
              : 1
      return sum + sub.amount * multiplier
    }, 0)

  const totalAnnualSpend = totalMonthlySpend * 12
  const unusedSubscriptions = subscriptions.filter((sub) => sub.isActive && sub.usageScore && sub.usageScore < 30)
  const potentialSavings = unusedSubscriptions.reduce((sum, sub) => sum + (sub.annualSavings || 0), 0)

  const getUsageColor = (score?: number) => {
    if (!score) return "text-gray-500"
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getUsageLabel = (score?: number) => {
    if (!score) return "Unknown"
    if (score >= 70) return "High Usage"
    if (score >= 40) return "Medium Usage"
    return "Low Usage"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Subscription Tracker
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-name">Service Name</Label>
                    <Input id="sub-name" placeholder="Netflix" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sub-amount">Monthly Cost</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="sub-amount" type="number" placeholder="15.99" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-frequency">Billing Cycle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Monthly" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next-billing">Next Billing Date</Label>
                    <Input id="next-billing" type="date" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Add Subscription</Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Monthly Spend</span>
              </div>
              <div className="text-2xl font-bold">${totalMonthlySpend.toFixed(2)}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Annual Spend</span>
              </div>
              <div className="text-2xl font-bold">${totalAnnualSpend.toFixed(0)}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active Subs</span>
              </div>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.isActive).length}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Potential Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(0)}</div>
            </Card>
          </div>

          {/* Optimization Insights */}
          {unusedSubscriptions.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Optimization Opportunity</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You have {unusedSubscriptions.length} low-usage subscriptions. Consider canceling them to save $
                      {potentialSavings.toFixed(0)} annually.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="bg-white">
                        Review Subscriptions
                      </Button>
                      <Button size="sm" variant="ghost">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <Label htmlFor="show-inactive" className="text-sm">
                Show inactive
              </Label>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-3">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${subscription.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.category} • {subscription.frequency}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">${subscription.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Next: {new Date(subscription.nextDue).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        {subscription.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {subscription.usageScore && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage Score</span>
                      <span className={getUsageColor(subscription.usageScore)}>
                        {getUsageLabel(subscription.usageScore)} ({subscription.usageScore}%)
                      </span>
                    </div>
                    <Progress value={subscription.usageScore} className="h-2" />
                    {subscription.usageScore < 30 && (
                      <div className="text-xs text-yellow-600">
                        💡 Consider canceling to save ${subscription.annualSavings || 0}/year
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subscriptions found for the selected filters.</p>
              <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setShowAddDialog(true)}>
                Add Your First Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
