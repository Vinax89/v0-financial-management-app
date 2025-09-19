"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Activity, Database, Zap, RefreshCw, Clock } from "lucide-react"
import { clientDbOptimizer } from "@/lib/client-db-optimizer"

interface PerformanceMetrics {
  cacheStats: {
    total: number
    active: number
    expired: number
    hitRate: string
  }
  queryPerformance: Array<{
    query_name: string
    avg_execution_time: number
    total_executions: number
    slowest_execution: number
  }>
  connectionStats: {
    active_connections: number
    idle_connections: number
    total_connections: number
  }
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheStats: { total: 0, active: 0, expired: 0, hitRate: "0.00" },
    queryPerformance: [],
    connectionStats: { active_connections: 0, idle_connections: 0, total_connections: 0 },
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const refreshMetrics = async () => {
    setIsRefreshing(true)
    try {
      const cacheStats = await clientDbOptimizer.getCacheStats()

      // Mock data for demo - in real app, fetch from database
      const mockMetrics: PerformanceMetrics = {
        cacheStats,
        queryPerformance: [
          { query_name: "getDashboardSummary", avg_execution_time: 45, total_executions: 1250, slowest_execution: 120 },
          {
            query_name: "getTransactionsByDateRange",
            avg_execution_time: 32,
            total_executions: 890,
            slowest_execution: 85,
          },
          { query_name: "getBudgetPerformance", avg_execution_time: 28, total_executions: 456, slowest_execution: 95 },
          { query_name: "searchTransactions", avg_execution_time: 67, total_executions: 234, slowest_execution: 180 },
        ],
        connectionStats: { active_connections: 8, idle_connections: 12, total_connections: 20 },
      }

      setMetrics(mockMetrics)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to refresh metrics:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const refreshMaterializedViews = async () => {
    try {
      await clientDbOptimizer.refreshMaterializedViews()
      await refreshMetrics()
    } catch (error) {
      console.error("Failed to refresh materialized views:", error)
    }
  }

  const clearCache = () => {
    clientDbOptimizer.clearCache()
    refreshMetrics()
  }

  useEffect(() => {
    refreshMetrics()
    const interval = setInterval(refreshMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getPerformanceColor = (time: number) => {
    if (time < 50) return "text-green-600"
    if (time < 100) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (time: number) => {
    if (time < 50) return <Badge className="bg-green-100 text-green-800">Fast</Badge>
    if (time < 100) return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
    return <Badge className="bg-red-100 text-red-800">Slow</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCache}>
            <Zap className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button variant="outline" onClick={refreshMaterializedViews}>
            <Database className="h-4 w-4 mr-2" />
            Refresh Views
          </Button>
          <Button onClick={refreshMetrics} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.cacheStats.hitRate}%</div>
            <Progress value={Number.parseFloat(metrics.cacheStats.hitRate)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cacheStats.active} active / {metrics.cacheStats.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.queryPerformance.length > 0
                ? Math.round(
                    metrics.queryPerformance.reduce((sum, q) => sum + q.avg_execution_time, 0) /
                      metrics.queryPerformance.length,
                  )
                : 0}
              ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.queryPerformance.reduce((sum, q) => sum + q.total_executions, 0)} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.connectionStats.active_connections}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.connectionStats.total_connections} total connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="queries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queries">Query Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Details</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Query Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of query execution times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.queryPerformance.map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{query.query_name}</div>
                      <div className="text-sm text-muted-foreground">{query.total_executions} executions</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-bold ${getPerformanceColor(query.avg_execution_time)}`}>
                          {query.avg_execution_time}ms
                        </div>
                        <div className="text-xs text-muted-foreground">Max: {query.slowest_execution}ms</div>
                      </div>
                      {getPerformanceBadge(query.avg_execution_time)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
              <CardDescription>In-memory cache performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.cacheStats.total}</div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.cacheStats.active}</div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.cacheStats.expired}</div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.cacheStats.hitRate}%</div>
                  <p className="text-sm text-muted-foreground">Hit Rate</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cache Efficiency</span>
                  <span className="text-sm text-muted-foreground">{metrics.cacheStats.hitRate}%</span>
                </div>
                <Progress value={Number.parseFloat(metrics.cacheStats.hitRate)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Database Connections</CardTitle>
              <CardDescription>Connection pool status and utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.connectionStats.active_connections}</div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.connectionStats.idle_connections}</div>
                  <p className="text-sm text-muted-foreground">Idle Connections</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metrics.connectionStats.total_connections}</div>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Connection Utilization</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(
                      (metrics.connectionStats.active_connections / metrics.connectionStats.total_connections) * 100,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(metrics.connectionStats.active_connections / metrics.connectionStats.total_connections) * 100}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { PerformanceMonitor }
