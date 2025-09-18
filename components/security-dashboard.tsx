"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle, Download, X } from "lucide-react"
import { SecurityAudit } from "@/lib/security-utils"

interface SecurityDashboardProps {
  onClose?: () => void
}

export function SecurityDashboard({ onClose }: SecurityDashboardProps) {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const updateLogs = () => {
      setLogs(SecurityAudit.getLogs())
    }

    updateLogs()
    const interval = setInterval(updateLogs, 30000)

    return () => clearInterval(interval)
  }, [])

  const highSeverityCount = logs.filter((log) => log.severity === "high").length
  const mediumSeverityCount = logs.filter((log) => log.severity === "medium").length
  const lowSeverityCount = logs.filter((log) => log.severity === "low").length

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `security-audit-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Security Monitor
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={exportLogs}>
                <Download className="w-3 h-3" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Security Status */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{highSeverityCount}</div>
              <div className="text-xs text-red-600">High</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{mediumSeverityCount}</div>
              <div className="text-xs text-yellow-600">Medium</div>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{lowSeverityCount}</div>
              <div className="text-xs text-green-600">Low</div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            {logs
              .slice(-10)
              .reverse()
              .map((log, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    {log.severity === "high" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    {log.severity === "medium" && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                    {log.severity === "low" && <CheckCircle className="w-3 h-3 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{log.event}</div>
                    <div className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <Badge
                    variant={
                      log.severity === "high" ? "destructive" : log.severity === "medium" ? "secondary" : "default"
                    }
                    className="text-xs"
                  >
                    {log.severity}
                  </Badge>
                </div>
              ))}
          </div>

          {/* Security Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Security Status: Active
              </span>
              <span className="text-muted-foreground">{logs.length} total events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
