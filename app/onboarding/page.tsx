"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface OnboardingData {
  firstName: string
  lastName: string
  dateOfBirth: string
  occupation: string
  annualIncome: string
  financialGoals: string[]
  riskTolerance: string
  preferredCurrency: string
}

const FINANCIAL_GOALS = [
  "Emergency Fund",
  "Retirement Savings",
  "Home Purchase",
  "Debt Payoff",
  "Investment Growth",
  "Education Fund",
  "Travel Fund",
  "Business Investment",
]

const STEPS = [
  { title: "Personal Information", description: "Tell us about yourself" },
  { title: "Financial Profile", description: "Your income and occupation" },
  { title: "Goals & Preferences", description: "What are you saving for?" },
  { title: "Complete Setup", description: "Finish your profile" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    occupation: "",
    annualIncome: "",
    financialGoals: [],
    riskTolerance: "",
    preferredCurrency: "USD",
  })
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed, onboarding_step")
        .eq("user_id", user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push("/dashboard")
        return
      }

      if (profile?.onboarding_step) {
        setCurrentStep(profile.onboarding_step)
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      // Save progress to database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("user_profiles").update({ onboarding_step: nextStep }).eq("user_id", user.id)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Save all onboarding data
      const { error } = await supabase
        .from("user_profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          occupation: data.occupation,
          annual_income: Number.parseFloat(data.annualIncome) || null,
          financial_goals: data.financialGoals,
          risk_tolerance: data.riskTolerance,
          preferred_currency: data.preferredCurrency,
          onboarding_completed: true,
          onboarding_step: STEPS.length,
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Welcome to your financial journey!",
        description: "Your profile has been set up successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }))
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FinanceApp</h1>
          <p className="text-gray-600">Let's set up your financial profile in just a few steps</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => setData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={data.occupation}
                    onChange={(e) => setData((prev) => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="annualIncome">Annual Income (optional)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={data.annualIncome}
                    onChange={(e) => setData((prev) => ({ ...prev, annualIncome: e.target.value }))}
                    placeholder="75000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    value={data.preferredCurrency}
                    onValueChange={(value) => setData((prev) => ({ ...prev, preferredCurrency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">
                    What are your financial goals? (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {FINANCIAL_GOALS.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={data.financialGoals.includes(goal)}
                          onCheckedChange={() => handleGoalToggle(goal)}
                        />
                        <Label htmlFor={goal} className="text-sm font-normal">
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={data.riskTolerance}
                    onValueChange={(value) => setData((prev) => ({ ...prev, riskTolerance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative - Prefer stable, low-risk investments</SelectItem>
                      <SelectItem value="moderate">Moderate - Balanced approach to risk and return</SelectItem>
                      <SelectItem value="aggressive">
                        Aggressive - Comfortable with high-risk, high-reward investments
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
                  <p className="text-gray-600">
                    Your financial profile is ready. Click finish to start managing your finances.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium mb-2">Profile Summary:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      Name: {data.firstName} {data.lastName}
                    </li>
                    <li>Occupation: {data.occupation}</li>
                    <li>Goals: {data.financialGoals.join(", ")}</li>
                    <li>Risk Tolerance: {data.riskTolerance}</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={loading}>
                  {loading ? "Setting up..." : "Finish Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
