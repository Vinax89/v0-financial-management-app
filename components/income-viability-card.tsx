import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign } from "lucide-react"

interface CostOfLiving {
  housing: number
  food: number
  transportation: number
  healthcare: number
  utilities: number
  other: number
  total: number
}

interface ViabilityStatus {
  status: string
  color: string
  message: string
}

interface IncomeViabilityCardProps {
  monthlyNet: number
  costOfLiving: CostOfLiving
  viabilityRatio: number
  status: ViabilityStatus
}

export function IncomeViabilityCard({ monthlyNet, costOfLiving, viabilityRatio, status }: IncomeViabilityCardProps) {
  const surplus = monthlyNet - costOfLiving.total
  const utilizationPercentage = (costOfLiving.total / monthlyNet) * 100

  const getStatusIcon = () => {
    switch (status.status) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "good":
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case "adequate":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Income Viability Analysis
          </span>
          <Badge variant={status.status === "challenging" ? "destructive" : "default"} className={status.color}>
            {status.message}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${monthlyNet.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Take-Home</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">${costOfLiving.total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Cost of Living</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${surplus >= 0 ? "text-green-600" : "text-red-600"}`}>
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Surplus</div>
          </div>
        </div>

        {/* Viability Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Income Coverage Ratio</span>
            <span className="text-sm font-bold">{viabilityRatio.toFixed(2)}x</span>
          </div>
          <Progress value={Math.min(viabilityRatio * 50, 100)} className="h-3" />
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className={status.color}>{status.message}</span>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Budget Utilization</span>
            <span className="text-sm font-bold">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="space-y-2">
            {Object.entries(costOfLiving)
              .filter(([key]) => key !== "total")
              .map(([category, amount]) => {
                const percentage = (amount / monthlyNet) * 100
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
                return (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="flex-1">{categoryName}</span>
                    <span className="w-16 text-right">${amount.toLocaleString()}</span>
                    <span className="w-12 text-right text-muted-foreground">{percentage.toFixed(1)}%</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium mb-2">Financial Recommendations</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {viabilityRatio >= 1.5 && (
              <>
                <li>• Consider increasing retirement contributions</li>
                <li>• Build emergency fund (6+ months expenses)</li>
                <li>• Explore investment opportunities</li>
              </>
            )}
            {viabilityRatio >= 1.2 && viabilityRatio < 1.5 && (
              <>
                <li>• Build emergency fund (3-6 months expenses)</li>
                <li>• Look for opportunities to increase income</li>
                <li>• Review and optimize major expenses</li>
              </>
            )}
            {viabilityRatio >= 1.0 && viabilityRatio < 1.2 && (
              <>
                <li>• Focus on essential expenses only</li>
                <li>• Look for additional income sources</li>
                <li>• Consider relocating to lower cost area</li>
              </>
            )}
            {viabilityRatio < 1.0 && (
              <>
                <li>• Immediate budget review required</li>
                <li>• Seek additional income opportunities</li>
                <li>• Consider financial assistance programs</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
