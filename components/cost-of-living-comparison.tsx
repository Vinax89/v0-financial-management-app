import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp, TrendingDown } from "lucide-react"

interface CostOfLiving {
  housing: number
  food: number
  transportation: number
  healthcare: number
  utilities: number
  other: number
  total: number
}

interface CostOfLivingComparisonProps {
  costOfLiving: CostOfLiving
  monthlyNet: number
  zipCode: string
}

export function CostOfLivingComparison({ costOfLiving, monthlyNet, zipCode }: CostOfLivingComparisonProps) {
  // Mock national averages - in real app this would come from official data sources
  const nationalAverages = {
    housing: 1200,
    food: 350,
    transportation: 250,
    healthcare: 200,
    utilities: 120,
    other: 280,
    total: 2400,
  }

  const getLocationName = (zip: string) => {
    if (zip.startsWith("100")) return "New York City, NY"
    if (zip.startsWith("1")) return "New York State"
    if (zip.startsWith("9")) return "California"
    if (zip.startsWith("7")) return "Texas"
    return "Your Area"
  }

  const locationName = getLocationName(zipCode)
  const costIndex = (costOfLiving.total / nationalAverages.total) * 100

  const categories = [
    { key: "housing", name: "Housing", icon: "🏠" },
    { key: "food", name: "Food & Groceries", icon: "🛒" },
    { key: "transportation", name: "Transportation", icon: "🚗" },
    { key: "healthcare", name: "Healthcare", icon: "🏥" },
    { key: "utilities", name: "Utilities", icon: "⚡" },
    { key: "other", name: "Other Expenses", icon: "💳" },
  ]

  return (
    <div className="space-y-4">
      {/* Location Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {locationName}
            </span>
            <Badge variant={costIndex > 120 ? "destructive" : costIndex > 100 ? "secondary" : "default"}>
              {costIndex.toFixed(0)}% of National Average
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${costOfLiving.total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Monthly Cost of Living</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${nationalAverages.total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">National Average</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                  costOfLiving.total > nationalAverages.total ? "text-red-600" : "text-green-600"
                }`}
              >
                {costOfLiving.total > nationalAverages.total ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {Math.abs(((costOfLiving.total - nationalAverages.total) / nationalAverages.total) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {costOfLiving.total > nationalAverages.total ? "Above" : "Below"} Average
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const localCost = costOfLiving[category.key as keyof CostOfLiving] as number
            const nationalCost = nationalAverages[category.key as keyof typeof nationalAverages]
            const difference = localCost - nationalCost
            const percentDiff = (difference / nationalCost) * 100
            const affordabilityRatio = (localCost / monthlyNet) * 100

            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${localCost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{affordabilityRatio.toFixed(1)}% of income</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={Math.min(affordabilityRatio, 100)} className="h-2" />
                  </div>
                  <div className="text-sm min-w-20 text-right">
                    <span className={difference >= 0 ? "text-red-600" : "text-green-600"}>
                      {difference >= 0 ? "+" : ""}${difference.toLocaleString()}
                    </span>
                    <div className="text-xs text-muted-foreground">vs national</div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Affordability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Affordability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Housing Affordability</span>
              <div className="text-right">
                <div className="font-medium">{((costOfLiving.housing / monthlyNet) * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  {costOfLiving.housing / monthlyNet <= 0.3 ? "Affordable" : "Above recommended 30%"}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Total Fixed Costs</span>
              <div className="text-right">
                <div className="font-medium">
                  {(((costOfLiving.housing + costOfLiving.utilities) / monthlyNet) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Housing + Utilities</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Discretionary Income</span>
              <div className="text-right">
                <div className="font-medium text-green-600">
                  ${(monthlyNet - costOfLiving.housing - costOfLiving.utilities - costOfLiving.food).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">After essentials</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
