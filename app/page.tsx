"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, DollarSign, Calendar, MapPin, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

interface OnboardingData {
  payRate: string
  shiftPattern: string
  zipCode: string
  filingStatus: string
  hasIncentives: boolean
  hasPremiumPay: boolean
  hasDifferentials: boolean
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    payRate: "",
    shiftPattern: "",
    zipCode: "",
    filingStatus: "",
    hasIncentives: false,
    hasPremiumPay: false,
    hasDifferentials: false,
  })

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      console.log("Onboarding complete:", data)
      setIsComplete(true)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const updateData = (field: keyof OnboardingData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome to Your Financial Hub!</h1>
            <p className="text-muted-foreground">
              Your comprehensive financial management system is ready with real-time calculations, tax optimization, and
              intelligent insights.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/dashboard">
                  <Button className="w-full" size="lg">
                    Launch Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard?tab=calculator">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      Tax Calculator
                    </Button>
                  </Link>
                  <Link href="/dashboard?tab=calendar">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      Financial Calendar
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/budget">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      Budget Manager
                    </Button>
                  </Link>
                  <Link href="/dashboard?tab=goals">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      Financial Goals
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Explore advanced features: Real-time tax calculations, unified calendar, performance monitoring, and
                  intelligent transaction categorization
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome to Your Financial Hub</h1>
          <p className="text-muted-foreground">
            Set up your comprehensive financial management system with real-time tax calculations and intelligent
            insights
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {step === 1 && <DollarSign className="w-6 h-6 text-primary" />}
              {step === 2 && <Calendar className="w-6 h-6 text-primary" />}
              {step === 3 && <MapPin className="w-6 h-6 text-primary" />}
              {step === 4 && <FileText className="w-6 h-6 text-primary" />}
            </div>
            <CardTitle className="font-heading">
              {step === 1 && "Pay Information"}
              {step === 2 && "Shift Pattern"}
              {step === 3 && "Location & Tax Info"}
              {step === 4 && "Additional Pay"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your hourly rate for accurate calculations"}
              {step === 2 && "How often do you get paid?"}
              {step === 3 && "For precise tax calculations and local rates"}
              {step === 4 && "Any extra pay types you receive?"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payRate">Hourly Pay Rate ($)</Label>
                  <Input
                    id="payRate"
                    type="number"
                    placeholder="25.00"
                    value={data.payRate}
                    onChange={(e) => updateData("payRate", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shiftPattern">Pay Frequency</Label>
                  <Select value={data.shiftPattern} onValueChange={(value) => updateData("shiftPattern", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your pay schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                      <SelectItem value="semimonthly">Semi-monthly (Twice a month)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    value={data.zipCode}
                    onChange={(e) => updateData("zipCode", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="filingStatus">Tax Filing Status</Label>
                  <Select value={data.filingStatus} onValueChange={(value) => updateData("filingStatus", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head-of-household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Check all that apply to your work situation:</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incentives"
                      checked={data.hasIncentives}
                      onCheckedChange={(checked) => updateData("hasIncentives", !!checked)}
                    />
                    <Label htmlFor="incentives" className="text-sm">
                      Performance incentives or bonuses
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premiumPay"
                      checked={data.hasPremiumPay}
                      onCheckedChange={(checked) => updateData("hasPremiumPay", !!checked)}
                    />
                    <Label htmlFor="premiumPay" className="text-sm">
                      Premium pay (weekends, holidays)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="differentials"
                      checked={data.hasDifferentials}
                      onCheckedChange={(checked) => updateData("hasDifferentials", !!checked)}
                    />
                    <Label htmlFor="differentials" className="text-sm">
                      Shift differentials (night, evening)
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="ml-auto"
                disabled={
                  (step === 1 && !data.payRate) ||
                  (step === 2 && !data.shiftPattern) ||
                  (step === 3 && (!data.zipCode || !data.filingStatus))
                }
              >
                {step === 4 ? "Complete Setup" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is encrypted and secure. We use bank-level security and never share your personal information.
        </p>
      </div>
    </div>
  )
}
