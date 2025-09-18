"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Target, Plus, Calendar, DollarSign, TrendingUp, Edit, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface BudgetGoal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  category: string
  deadline: Date
  status: "active" | "completed" | "overdue" | "paused"
  priority: "low" | "medium" | "high"
  createdAt: Date
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  targetAmount: number
  targetDate: Date
  completed: boolean
  completedAt?: Date
}

export default function BudgetGoalsPage() {
  const [goals, setGoals] = useState<BudgetGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<BudgetGoal | null>(null)

  useEffect(() => {
    loadBudgetGoals()
  }, [])

  const loadBudgetGoals = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockGoals: BudgetGoal[] = [
        {
          id: "1",
          title: "Emergency Fund",
          description: "Build a 6-month emergency fund for financial security",
          targetAmount: 15000,
          currentAmount: 8500,
          category: "Savings",
          deadline: new Date("2025-06-30"),
          status: "active",
          priority: "high",
          createdAt: new Date("2024-01-01"),
          milestones: [
            {
              id: "1",
              title: "First $5,000",
              targetAmount: 5000,
              targetDate: new Date("2024-03-31"),
              completed: true,
              completedAt: new Date("2024-03-15"),
            },
            {
              id: "2",
              title: "Halfway Point",
              targetAmount: 7500,
              targetDate: new Date("2024-06-30"),
              completed: true,
              completedAt: new Date("2024-06-20"),
            },
            {
              id: "3",
              title: "Three-quarters",
              targetAmount: 11250,
              targetDate: new Date("2024-09-30"),
              completed: false,
            },
            {
              id: "4",
              title: "Full Amount",
              targetAmount: 15000,
              targetDate: new Date("2025-06-30"),
              completed: false,
            },
          ],
        },
        {
          id: "2",
          title: "Vacation Fund",
          description: "Save for a 2-week European vacation",
          targetAmount: 5000,
          currentAmount: 2800,
          category: "Travel",
          deadline: new Date("2025-07-01"),
          status: "active",
          priority: "medium",
          createdAt: new Date("2024-02-01"),
          milestones: [
            {
              id: "1",
              title: "Flight Money",
              targetAmount: 1500,
              targetDate: new Date("2024-12-31"),
              completed: true,
              completedAt: new Date("2024-11-15"),
            },
            {
              id: "2",
              title: "Accommodation",
              targetAmount: 3000,
              targetDate: new Date("2025-03-31"),
              completed: false,
            },
            {
              id: "3",
              title: "Activities & Food",
              targetAmount: 5000,
              targetDate: new Date("2025-07-01"),
              completed: false,
            },
          ],
        },
        {
          id: "3",
          title: "New Car Down Payment",
          description: "Save 20% down payment for a reliable car",
          targetAmount: 8000,
          currentAmount: 8000,
          category: "Transportation",
          deadline: new Date("2024-12-31"),
          status: "completed",
          priority: "high",
          createdAt: new Date("2024-01-15"),
          milestones: [
            {
              id: "1",
              title: "Quarter Goal",
              targetAmount: 2000,
              targetDate: new Date("2024-06-30"),
              completed: true,
              completedAt: new Date("2024-06-15"),
            },
            {
              id: "2",
              title: "Halfway Point",
              targetAmount: 4000,
              targetDate: new Date("2024-09-30"),
              completed: true,
              completedAt: new Date("2024-09-10"),
            },
            {
              id: "3",
              title: "Full Amount",
              targetAmount: 8000,
              targetDate: new Date("2024-12-31"),
              completed: true,
              completedAt: new Date("2024-12-01"),
            },
          ],
        },
      ]

      setGoals(mockGoals)
    } catch (error) {
      console.error("Failed to load budget goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "active":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "paused":
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "active":
        return "secondary"
      case "overdue":
        return "destructive"
      case "paused":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysRemaining = (deadline: Date) => {
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  const categoryData = goals.reduce((acc, goal) => {
    const existing = acc.find((item) => item.name === goal.category)
    if (existing) {
      existing.value += goal.targetAmount
      existing.current += goal.currentAmount
    } else {
      acc.push({
        name: goal.category,
        value: goal.targetAmount,
        current: goal.currentAmount,
        color: goal.category === "Savings" ? "#0891b2" : goal.category === "Travel" ? "#ec4899" : "#f59e0b",
      })
    }
    return acc
  }, [] as any[])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold">Budget Goals</h1>
          <div className="w-32 h-10 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Budget Goals</h1>
          <p className="text-muted-foreground">Set and track your financial goals and milestones</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Budget Goal</DialogTitle>
              <DialogDescription>Set up a new financial goal to track your progress</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="Emergency Fund" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" placeholder="Build a 6-month emergency fund..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Amount</Label>
                  <Input id="target" type="number" placeholder="15000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current">Current Amount</Label>
                  <Input id="current" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input id="deadline" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateDialogOpen(false)}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeGoals.length} active, {completedGoals.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTargetAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCurrentAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1)}% of target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((completedGoals.length / goals.length) * 100).toFixed(0)}%</div>
            <Progress value={(completedGoals.length / goals.length) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <Card
                key={goal.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedGoal(goal)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <Badge variant={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={calculateProgress(goal.currentAmount, goal.targetAmount)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}% complete</span>
                      <span>${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{getDaysRemaining(goal.deadline)} days left</span>
                    </div>
                    <Badge variant={getStatusColor(goal.status)}>{goal.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Milestones</div>
                    <div className="space-y-1">
                      {goal.milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2 text-xs">
                          <div
                            className={`w-2 h-2 rounded-full ${milestone.completed ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                      {goal.milestones.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{goal.milestones.length - 2} more milestones
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Final Amount</span>
                      <span className="font-medium text-green-600">${goal.currentAmount.toLocaleString()}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="text-sm text-muted-foreground">Completed on {goal.deadline.toLocaleDateString()}</div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Milestones Achieved</div>
                    <div className="text-xs text-green-600">
                      {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goals by Category</CardTitle>
                <CardDescription>Distribution of your financial goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Target Amount", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>Your savings progress across all goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    progress: { label: "Total Saved", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", progress: 2000 },
                        { month: "Feb", progress: 4500 },
                        { month: "Mar", progress: 7200 },
                        { month: "Apr", progress: 9800 },
                        { month: "May", progress: 12500 },
                        { month: "Jun", progress: 15300 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="var(--color-progress)"
                        strokeWidth={3}
                        name="Total Saved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Goal Detail Dialog */}
      {selectedGoal && (
        <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getStatusIcon(selectedGoal.status)}
                {selectedGoal.title}
              </DialogTitle>
              <DialogDescription>{selectedGoal.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Progress</Label>
                  <div className="text-2xl font-bold">${selectedGoal.currentAmount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    of ${selectedGoal.targetAmount.toLocaleString()} target
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completion</Label>
                  <div className="text-2xl font-bold">
                    {calculateProgress(selectedGoal.currentAmount, selectedGoal.targetAmount).toFixed(1)}%
                  </div>
                  <Progress
                    value={calculateProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Milestones</Label>
                <div className="space-y-3">
                  {selectedGoal.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          milestone.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {milestone.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {milestone.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${milestone.targetAmount.toLocaleString()} by {milestone.targetDate.toLocaleDateString()}
                        </div>
                        {milestone.completed && milestone.completedAt && (
                          <div className="text-xs text-green-600">
                            Completed on {milestone.completedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Goal
              </Button>
              <Button>Update Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
