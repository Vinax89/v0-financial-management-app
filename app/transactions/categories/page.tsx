"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Plus, Edit, Tag, TrendingUp, DollarSign, Palette, Search, Filter, MoreHorizontal } from "lucide-react"

interface TransactionCategory {
  id: string
  name: string
  parentId?: string
  color: string
  icon: string
  keywords: string[]
  patterns: string[]
  confidenceThreshold: number
  isSystem: boolean
  transactionCount: number
  totalAmount: number
  avgAmount: number
  lastUsed?: Date
  children?: TransactionCategory[]
}

export default function TransactionCategoriesPage() {
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockCategories: TransactionCategory[] = [
        {
          id: "1",
          name: "Food & Dining",
          color: "#f59e0b",
          icon: "Utensils",
          keywords: ["restaurant", "grocery", "food", "dining", "cafe", "pizza", "burger"],
          patterns: ["RESTAURANT", "GROCERY", "FOOD", "STARBUCKS", "MCDONALD"],
          confidenceThreshold: 0.8,
          isSystem: true,
          transactionCount: 156,
          totalAmount: 2340.5,
          avgAmount: 15.0,
          lastUsed: new Date("2024-12-15"),
          children: [
            {
              id: "1a",
              name: "Restaurants",
              parentId: "1",
              color: "#f59e0b",
              icon: "Utensils",
              keywords: ["restaurant", "dining", "cafe"],
              patterns: ["RESTAURANT", "CAFE"],
              confidenceThreshold: 0.8,
              isSystem: false,
              transactionCount: 89,
              totalAmount: 1450.25,
              avgAmount: 16.3,
              lastUsed: new Date("2024-12-15"),
            },
            {
              id: "1b",
              name: "Groceries",
              parentId: "1",
              color: "#f59e0b",
              icon: "ShoppingCart",
              keywords: ["grocery", "supermarket", "market"],
              patterns: ["GROCERY", "WALMART", "TARGET"],
              confidenceThreshold: 0.9,
              isSystem: false,
              transactionCount: 67,
              totalAmount: 890.25,
              avgAmount: 13.29,
              lastUsed: new Date("2024-12-14"),
            },
          ],
        },
        {
          id: "2",
          name: "Transportation",
          color: "#3b82f6",
          icon: "Car",
          keywords: ["gas", "fuel", "uber", "taxi", "parking", "metro", "bus"],
          patterns: ["GAS STATION", "UBER", "PARKING", "METRO"],
          confidenceThreshold: 0.8,
          isSystem: true,
          transactionCount: 78,
          totalAmount: 1250.75,
          avgAmount: 16.04,
          lastUsed: new Date("2024-12-14"),
        },
        {
          id: "3",
          name: "Shopping",
          color: "#ec4899",
          icon: "ShoppingBag",
          keywords: ["amazon", "store", "retail", "shopping", "clothes", "electronics"],
          patterns: ["AMAZON", "WALMART", "TARGET", "BEST BUY"],
          confidenceThreshold: 0.7,
          isSystem: true,
          transactionCount: 92,
          totalAmount: 1890.3,
          avgAmount: 20.55,
          lastUsed: new Date("2024-12-13"),
        },
        {
          id: "4",
          name: "Bills & Utilities",
          color: "#ef4444",
          icon: "Zap",
          keywords: ["electric", "water", "internet", "phone", "utility", "bill"],
          patterns: ["ELECTRIC", "WATER", "INTERNET", "PHONE"],
          confidenceThreshold: 0.9,
          isSystem: true,
          transactionCount: 24,
          totalAmount: 1450.0,
          avgAmount: 60.42,
          lastUsed: new Date("2024-12-01"),
        },
        {
          id: "5",
          name: "Healthcare",
          color: "#8b5cf6",
          icon: "Heart",
          keywords: ["doctor", "pharmacy", "medical", "health", "hospital"],
          patterns: ["PHARMACY", "MEDICAL", "DOCTOR", "HOSPITAL"],
          confidenceThreshold: 0.8,
          isSystem: true,
          transactionCount: 15,
          totalAmount: 890.5,
          avgAmount: 59.37,
          lastUsed: new Date("2024-11-28"),
        },
        {
          id: "6",
          name: "Entertainment",
          color: "#06b6d4",
          icon: "Film",
          keywords: ["movie", "streaming", "entertainment", "netflix", "spotify", "games"],
          patterns: ["NETFLIX", "SPOTIFY", "MOVIE", "STEAM"],
          confidenceThreshold: 0.8,
          isSystem: true,
          transactionCount: 45,
          totalAmount: 567.25,
          avgAmount: 12.61,
          lastUsed: new Date("2024-12-10"),
        },
      ]

      setCategories(mockCategories)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterType === "all" ||
      (filterType === "system" && category.isSystem) ||
      (filterType === "custom" && !category.isSystem) ||
      (filterType === "parent" && !category.parentId) ||
      (filterType === "child" && category.parentId)

    return matchesSearch && matchesFilter
  })

  const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0)
  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalAmount, 0)

  const chartData = categories.slice(0, 6).map((cat) => ({
    name: cat.name,
    value: cat.totalAmount,
    count: cat.transactionCount,
    color: cat.color,
  }))

  const usageData = categories.slice(0, 8).map((cat) => ({
    name: cat.name.length > 12 ? cat.name.substring(0, 12) + "..." : cat.name,
    transactions: cat.transactionCount,
    amount: cat.totalAmount,
  }))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold">Transaction Categories</h1>
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
          <h1 className="text-3xl font-heading font-bold">Transaction Categories</h1>
          <p className="text-muted-foreground">Manage and organize your transaction categories</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>Add a new transaction category with custom rules</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" placeholder="Home & Garden" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input id="color" type="color" defaultValue="#0891b2" className="w-16 h-10" />
                    <Input placeholder="#0891b2" className="flex-1" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent">Parent Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {categories
                        .filter((c) => !c.parentId)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input id="keywords" placeholder="home, garden, hardware, tools" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="patterns">Merchant Patterns (comma separated)</Label>
                <Input id="patterns" placeholder="HOME DEPOT, LOWES, GARDEN CENTER" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confidence">Confidence Threshold</Label>
                <Select defaultValue="0.8">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.6">60% - Low (More matches)</SelectItem>
                    <SelectItem value="0.7">70% - Medium-Low</SelectItem>
                    <SelectItem value="0.8">80% - Medium (Recommended)</SelectItem>
                    <SelectItem value="0.9">90% - High (Fewer matches)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateDialogOpen(false)}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.filter((c) => c.isSystem).length} system, {categories.filter((c) => !c.isSystem).length}{" "}
              custom
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Categorized transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <Palette className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAmount / totalTransactions).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average transaction amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="system">System Categories</SelectItem>
            <SelectItem value="custom">Custom Categories</SelectItem>
            <SelectItem value="parent">Parent Categories</SelectItem>
            <SelectItem value="child">Sub Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Category List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rules">Auto-Categorization Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          {category.isSystem && <Badge variant="secondary">System</Badge>}
                          {category.parentId && <Badge variant="outline">Sub-category</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {category.transactionCount} transactions • ${category.totalAmount.toLocaleString()} total
                          {category.lastUsed && ` • Last used ${category.lastUsed.toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className="font-medium">${category.avgAmount.toFixed(2)}</div>
                        <div className="text-muted-foreground">avg amount</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {category.keywords.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Keywords:</div>
                      <div className="flex flex-wrap gap-1">
                        {category.keywords.slice(0, 8).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {category.keywords.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.keywords.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {category.children && category.children.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Sub-categories:</div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {category.children.map((child) => (
                          <div key={child.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: child.color }}></div>
                            <span className="text-sm">{child.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{child.transactionCount} txns</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Distribution of your spending across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Amount", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
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
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Number of transactions per category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    transactions: { label: "Transactions", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="transactions" fill="var(--color-transactions)" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Detailed breakdown of category usage and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Avg Amount</TableHead>
                    <TableHead className="text-right">Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                            {category.name}
                            {category.isSystem && (
                              <Badge variant="secondary" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{category.transactionCount}</TableCell>
                        <TableCell className="text-right">${category.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${category.avgAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {category.lastUsed ? category.lastUsed.toLocaleDateString() : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Categorization Rules</CardTitle>
              <CardDescription>Manage how transactions are automatically categorized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories
                  .filter((c) => c.keywords.length > 0 || c.patterns.length > 0)
                  .map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge variant="outline">{(category.confidenceThreshold * 100).toFixed(0)}% confidence</Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {category.keywords.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Keywords</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {category.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {category.patterns.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Merchant Patterns</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {category.patterns.map((pattern, index) => (
                                <Badge key={index} variant="outline" className="text-xs font-mono">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
