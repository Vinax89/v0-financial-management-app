"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TaxDataUpdater() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleUpdateTaxData = async () => {
    setIsUpdating(true)
    setUpdateStatus("idle")

    try {
      const response = await fetch("/api/update-tax-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: new Date().getFullYear() }),
      })

      const result = await response.json()

      if (result.success) {
        setUpdateStatus("success")
        setLastUpdated(result.lastUpdated)
        toast({
          title: "Tax Data Updated",
          description: "Latest tax brackets and rates have been successfully updated.",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      setUpdateStatus("error")
      toast({
        title: "Update Failed",
        description: "Failed to update tax data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch("/api/update-tax-data")
      const data = await response.json()
      setLastUpdated(data.lastUpdated)
    } catch (error) {
      console.error("Failed to fetch update status:", error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Tax Data Manager
        </CardTitle>
        <CardDescription>Update tax brackets and rates from official government sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            variant={updateStatus === "success" ? "default" : updateStatus === "error" ? "destructive" : "secondary"}
          >
            {updateStatus === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
            {updateStatus === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
            {updateStatus === "success" ? "Up to date" : updateStatus === "error" ? "Update failed" : "Ready"}
          </Badge>
        </div>

        {lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last updated:</span>
            <span className="text-sm font-medium">{new Date(lastUpdated).toLocaleDateString()}</span>
          </div>
        )}

        <Button onClick={handleUpdateTaxData} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Tax Data
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Updates federal tax brackets, state tax rates, and payroll tax information from official sources.
        </p>
      </CardContent>
    </Card>
  )
}
