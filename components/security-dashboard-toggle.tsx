"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { SecurityDashboard } from "@/components/security-dashboard"

export function SecurityDashboardToggle() {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50">
        <Shield className="w-4 h-4 mr-2" />
        Security Monitor
      </Button>
    )
  }

  return <SecurityDashboard onClose={() => setIsVisible(false)} />
}
