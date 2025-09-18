"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target, AlertCircle, RefreshCw } from "lucide-react"

interface Holding {
  id: string
  symbol: string
  name: string
  shares: number
  currentPrice: number
  costBasis: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
  totalReturn: number
  totalReturnPercent: number
  allocation: number
}

interface AssetAllocation {
  category: string
  value: number
  percentage: number
  target: number
  color: string
}

export function PortfolioOverview() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M")

  const holdings: Holding[] = [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 25,
      currentPrice: 185.92,
      costBasis: 4200,
      marketValue: 4648,
      dayChange: 2.15,
      dayChangePercent: 1.17,
      totalReturn: 448,
      totalReturnPercent: 10.67,
      allocation: 18.5,
    },
    {
      id: "2",
      symbol: "VTSAX",
      name: "Vanguard Total Stock Market",
      shares: 45,
      currentPrice: 112.34,
      costBasis: 4800,
      marketValue: 5055.3,
      dayChange: -8.45,
      dayChangePercent: -0.17,
      totalReturn: 255.3,
      totalReturnPercent: 5.32,
      allocation: 20.1,
    },
    {
      id: "3",
      symbol: "BTC",
      name: "Bitcoin",
      shares: 0.15,
      currentPrice: 42500,
      costBasis: 5800,
      marketValue: 6375,
      dayChange: 125.5,
      dayChangePercent: 2.01,
      totalReturn: 575,
      totalReturnPercent: 9.91,
      allocation: 25.4,
    },
    {
      id: "4",
      symbol: "VTIAX",
      name: "Vanguard International Stock",
      shares: 60,
      currentPrice: 89.45,
      costBasis: 5200,
      marketValue: 5367,
      dayChange: -12.3,
      dayChangePercent: -0.23,
      totalReturn: 167,
      totalReturnPercent: 3.21,
      allocation: 21.4,
    },
    {
      id: "5",
      symbol: "VBTLX",
      name: "Vanguard Total Bond Market",
      shares: 35,
      currentPrice: 98.76,
      costBasis: 3500,
      marketValue: 3456.6,
      dayChange: 1.2,
      dayChangePercent: 0.03,
      totalReturn: -43.4,
      totalReturnPercent: -1.24,
      allocation: 13.8,
    },
  ]

  const assetAllocation: AssetAllocation[] = [
    { category: "US Stocks", value: 9703.3, percentage: 38.6, target: 40, color: "#3b82f6" },
    { category: "Crypto", value: 6375, percentage: 25.4, target: 20, color: "#f59e0b" },
    { category: "International", value: 5367, percentage: 21.4, target: 25, color: "#10b981" },
    { category: "Bonds", value: 3456.6, percentage: 13.8, target: 15, color: "#8b5cf6" },
    { category: "Cash", value: 200, percentage: 0.8, target: 5, color: "#6b7280" },
  ]

  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const totalDayChange = holdings.reduce((sum, holding) => sum + holding.dayChange, 0)
  const totalDayChangePercent = (totalDayChange / (totalPortfolioValue - totalDayChange)) * 100
  const totalReturn = holdings.reduce((sum, holding) => sum + holding.totalReturn, 0)
  const totalReturnPercent = (totalReturn / (totalPortfolioValue - totalReturn)) * 100

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <div
              className={`flex items-center gap-1 text-sm ${totalDayChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalDayChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {totalDayChangePercent >= 0 ? "+" : ""}${totalDayChange.toFixed(2)} ({totalDayChangePercent.toFixed(2)}
                %)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}
            </div>
            <div className={`text-sm ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalReturnPercent >= 0 ? "+" : ""}
              {totalReturnPercent.toFixed(2)}% all time
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <div className="text-sm text-muted-foreground">Active positions</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Allocation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <div className="text-sm text-muted-foreground">Target alignment</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Portfolio Holdings</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Prices
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm">{holding.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{holding.symbol}</h4>
                        <p className="text-sm text-muted-foreground">{holding.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {holding.shares} shares @ ${holding.currentPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${holding.marketValue.toLocaleString()}</div>
                      <div className={`text-sm ${holding.dayChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {holding.dayChangePercent >= 0 ? "+" : ""}${holding.dayChange.toFixed(2)} (
                        {holding.dayChangePercent.toFixed(2)}%)
                      </div>
                      <div className={`text-xs ${holding.totalReturnPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {holding.totalReturnPercent >= 0 ? "+" : ""}
                        {holding.totalReturnPercent.toFixed(2)}% total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <p className="text-sm text-muted-foreground">Current vs target allocation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {assetAllocation.map((asset) => {
                const isOverAllocated = asset.percentage > asset.target
                const deviation = Math.abs(asset.percentage - asset.target)

                return (
                  <div key={asset.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="font-semibold">{asset.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${asset.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.percentage.toFixed(1)}% (Target: {asset.target}%)
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {asset.percentage.toFixed(1)}%</span>
                        <span>Target: {asset.target}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={asset.percentage} className="h-3" />
                        <div
                          className="absolute top-0 h-3 bg-gray-300 opacity-50 rounded-full"
                          style={{ width: `${asset.target}%` }}
                        />
                      </div>
                      {deviation > 2 && (
                        <div
                          className={`flex items-center gap-1 text-xs ${isOverAllocated ? "text-orange-600" : "text-blue-600"}`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {isOverAllocated ? "Over" : "Under"} allocated by {deviation.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rebalancing Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Crypto Overweight</p>
                    <p className="text-sm text-orange-700">
                      Consider reducing crypto allocation by 5.4% to meet target
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Increase International Exposure</p>
                    <p className="text-sm text-blue-700">Add 3.6% to international stocks to reach target allocation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+8.7%</div>
                  <div className="text-sm text-green-700">YTD Return</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0.85</div>
                  <div className="text-sm text-blue-700">Sharpe Ratio</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12.4%</div>
                  <div className="text-sm text-purple-700">Volatility</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Top Performers</h4>
                {holdings
                  .sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)
                  .slice(0, 3)
                  .map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-semibold">{holding.symbol}</span>
                        <span className="text-sm text-muted-foreground ml-2">{holding.name}</span>
                      </div>
                      <div className="text-green-600 font-bold">+{holding.totalReturnPercent.toFixed(2)}%</div>
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
