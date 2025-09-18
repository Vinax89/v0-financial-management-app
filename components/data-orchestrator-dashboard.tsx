"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  Play,
} from "lucide-react"

interface DataSource {
  id: string
  name: string
  type: string
  status: string
  lastSync?: Date
}

interface ProcessingJob {
  id: string
  jobType: string
  status: string
  createdAt: Date
  completedAt?: Date
  errorDetails?: string
}

interface WatchdogAlert {
  id: string
  alertType: string
  severity: string
  title: string
  description?: string
  createdAt: Date
  isResolved: boolean
}

export function DataOrchestratorDashboard() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([])
  const [watchdogAlerts, setWatchdogAlerts] = useState<WatchdogAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load data sources, jobs, and alerts
      // This would connect to your API endpoints
      console.log("[v0] Loading orchestrator dashboard data")

      // Mock data for demonstration
      setDataSources([
        { id: "1", name: "Bank Account - Chase", type: "plaid", status: "active", lastSync: new Date() },
        {
          id: "2",
          name: "Credit Card - Amex",
          type: "plaid",
          status: "active",
          lastSync: new Date(Date.now() - 3600000),
        },
        { id: "3", name: "Manual Entries", type: "manual", status: "active" },
      ])

      setProcessingJobs([
        { id: "1", jobType: "import", status: "completed", createdAt: new Date(), completedAt: new Date() },
        { id: "2", jobType: "categorize", status: "processing", createdAt: new Date() },
        { id: "3", jobType: "validate", status: "pending", createdAt: new Date() },
      ])

      setWatchdogAlerts([
        {
          id: "1",
          alertType: "data_anomaly",
          severity: "medium",
          title: "Unusual spending pattern detected",
          description: "Spending in Entertainment category is 150% above average",
          createdAt: new Date(),
          isResolved: false,
        },
      ])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Data Orchestrator</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
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
          <h2 className="text-2xl font-heading font-bold">Data Orchestrator</h2>
          <p className="text-muted-foreground">Monitor and manage data processing, validation, and quality</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-muted-foreground">
              {dataSources.filter((s) => s.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Jobs</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {processingJobs.filter((j) => j.status === "processing").length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchdogAlerts.filter((a) => !a.isResolved).length}</div>
            <p className="text-xs text-muted-foreground">
              {watchdogAlerts.filter((a) => a.severity === "high" || a.severity === "critical").length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <Progress value={94} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
          <TabsTrigger value="alerts">Watchdog Alerts</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Data Sources</CardTitle>
              <CardDescription>Manage your connected accounts and data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(source.status)}
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {source.type} • Last sync: {source.lastSync ? source.lastSync.toLocaleString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={source.status === "active" ? "default" : "secondary"}>{source.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Jobs</CardTitle>
              <CardDescription>Monitor data processing and transformation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-medium capitalize">{job.jobType} Job</h4>
                        <p className="text-sm text-muted-foreground">
                          Started: {job.createdAt.toLocaleString()}
                          {job.completedAt && ` • Completed: ${job.completedAt.toLocaleString()}`}
                        </p>
                        {job.errorDetails && <p className="text-sm text-red-600 mt-1">{job.errorDetails}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.status === "completed" ? "default" : "secondary"}>{job.status}</Badge>
                      {job.status === "pending" && (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {watchdogAlerts
              .filter((a) => !a.isResolved)
              .map((alert) => (
                <Alert key={alert.id} variant={getSeverityColor(alert.severity) as any}>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    <Badge variant={getSeverityColor(alert.severity) as any}>{alert.severity}</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.description}
                    <div className="mt-2 text-xs text-muted-foreground">{alert.createdAt.toLocaleString()}</div>
                  </AlertDescription>
                </Alert>
              ))}

            {watchdogAlerts.filter((a) => !a.isResolved).length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">All Clear!</h3>
                    <p className="text-muted-foreground">No active alerts at this time</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Accuracy</CardTitle>
                <CardDescription>Percentage of correctly categorized transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">96%</div>
                <Progress value={96} className="mb-2" />
                <p className="text-sm text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Completeness</CardTitle>
                <CardDescription>Percentage of transactions with all required fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">92%</div>
                <Progress value={92} className="mb-2" />
                <p className="text-sm text-muted-foreground">-1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Speed</CardTitle>
                <CardDescription>Average time to process new transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">2.3s</div>
                <p className="text-sm text-muted-foreground">-0.5s from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Percentage of failed processing jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">0.8%</div>
                <Progress value={0.8} className="mb-2" />
                <p className="text-sm text-muted-foreground">-0.2% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
