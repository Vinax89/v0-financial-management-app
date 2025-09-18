"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, TrendingDown, Search, Star, AlertCircle, Target, Calendar, DollarSign } from "lucide-react"

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  currentPrice: number
  dayChange: number
  dayChangePercent: number
  targetPrice?: number
  notes?: string
  isOwned: boolean
}

interface InvestmentGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  category: string
}

export function InvestmentTracker() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      id: "1",
      symbol: "TSLA",
      name: "Tesla Inc.",
      currentPrice: 248.42,
      dayChange: -3.21,
      dayChangePercent: -1.27,
      targetPrice: 300,
      notes: "Waiting for better entry point",
      isOwned: false,
    },
    {
      id: "2",
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      currentPrice: 875.28,
      dayChange: 12.45,
      dayChangePercent: 1.44,
      targetPrice: 950,
      notes: "AI growth potential",
      isOwned: false,
    },
    {
      id: "3",
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      currentPrice: 245.67,
      dayChange: 0.89,
      dayChangePercent: 0.36,
      isOwned: true,
    },
  ])

  const [investmentGoals, setInvestmentGoals] = useState<InvestmentGoal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 25000,
      currentAmount: 18500,
      targetDate: "2024-12-31",
      monthlyContribution: 1000,
      category: "Safety",
    },
    {
      id: "2",
      name: "Retirement Fund",
      targetAmount: 1000000,
      currentAmount: 125000,
      targetDate: "2054-01-01",
      monthlyContribution: 1500,
      category: "Retirement",
    },
    {
      id: "3",
      name: "House Down Payment",
      targetAmount: 80000,
      currentAmount: 32000,
      targetDate: "2026-06-01",
      monthlyContribution: 2000,
      category: "Major Purchase",
    },
  ])

  const [newSymbol, setNewSymbol] = useState("")
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return

    // Simulate API call to get stock data
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      name: `${newSymbol.toUpperCase()} Company`,
      currentPrice: Math.random() * 200 + 50,
      dayChange: (Math.random() - 0.5) * 10,
      dayChangePercent: (Math.random() - 0.5) * 5,
      isOwned: false,
    }
    newItem.dayChangePercent = (newItem.dayChange / (newItem.currentPrice - newItem.dayChange)) * 100

    setWatchlist([...watchlist, newItem])
    setNewSymbol("")
    setIsAddingToWatchlist(false)
  }

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="watchlist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="goals">Investment Goals</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Investment Watchlist
              </CardTitle>
              <Dialog open={isAddingToWatchlist} onOpenChange={setIsAddingToWatchlist}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Symbol
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Watchlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="symbol">Stock Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., AAPL, MSFT, GOOGL"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addToWatchlist()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addToWatchlist} disabled={!newSymbol.trim()}>
                        Add to Watchlist
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingToWatchlist(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {watchlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm">{item.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.symbol}</h4>
                          {item.isOwned && <Badge variant="secondary">Owned</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                        {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${item.currentPrice.toFixed(2)}</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${item.dayChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.dayChangePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                          {item.dayChangePercent >= 0 ? "+" : ""}${item.dayChange.toFixed(2)} (
                          {item.dayChangePercent.toFixed(2)}%)
                        </span>
                      </div>
                      {item.targetPrice && (
                        <div className="text-xs text-muted-foreground">Target: ${item.targetPrice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Investment Goals
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {investmentGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const remaining = goal.targetAmount - goal.currentAmount
                  const monthsRemaining = Math.ceil(
                    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30),
                  )
                  const monthsToGoal = remaining / goal.monthlyContribution

                  return (
                    <Card key={goal.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{goal.name}</h4>
                            <Badge variant="outline">{goal.category}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${goal.currentAmount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              of ${goal.targetAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {progress.toFixed(1)}%</span>
                            <span>${remaining.toLocaleString()} remaining</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div
                              className="h-3 bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>${goal.monthlyContribution}/month</span>
                            </div>
                          </div>

                          {monthsToGoal > monthsRemaining && (
                            <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span className="text-orange-700">
                                Need ${Math.ceil(remaining / monthsRemaining - goal.monthlyContribution)}/month more to
                                reach goal on time
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Investment Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search stocks, ETFs, or mutual funds..." className="flex-1" />
                  <Button>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Market Movers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">NVDA</span>
                        <span className="text-green-600 font-bold">+2.4%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">TSLA</span>
                        <span className="text-red-600 font-bold">-1.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">AAPL</span>
                        <span className="text-green-600 font-bold">+0.9%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Trending ETFs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">VTI</span>
                        <span className="text-green-600 font-bold">+0.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">QQQ</span>
                        <span className="text-green-600 font-bold">+1.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">SPY</span>
                        <span className="text-green-600 font-bold">+0.3%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
