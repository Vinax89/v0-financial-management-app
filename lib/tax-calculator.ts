interface TaxBracket {
  min: number
  max: number
  rate: number
}

interface StateTaxData {
  name: string
  brackets: TaxBracket[]
  standardDeduction: { single: number; marriedJoint: number; marriedSeparate: number; headOfHousehold: number }
  hasLocalTax: boolean
  localTaxRate?: number
}

interface LocalTaxData {
  city: string
  county: string
  rate: number
}

// 2024 Federal Tax Brackets
const FEDERAL_TAX_BRACKETS_2024: Record<string, TaxBracket[]> = {
  single: [
    { min: 0, max: 11000, rate: 0.1 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
  "married-joint": [
    { min: 0, max: 22000, rate: 0.1 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
  "married-separate": [
    { min: 0, max: 11000, rate: 0.1 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 346875, rate: 0.35 },
    { min: 346875, max: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
  "head-of-household": [
    { min: 0, max: 15700, rate: 0.1 },
    { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 95350, rate: 0.22 },
    { min: 95350, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578100, rate: 0.35 },
    { min: 578100, max: Number.POSITIVE_INFINITY, rate: 0.37 },
  ],
}

const FEDERAL_STANDARD_DEDUCTIONS_2024 = {
  single: 13850,
  "married-joint": 27700,
  "married-separate": 13850,
  "head-of-household": 20800,
}

// State tax data (simplified - in production would use comprehensive database)
const STATE_TAX_DATA: Record<string, StateTaxData> = {
  NY: {
    name: "New York",
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.055 },
      { min: 80650, max: 215400, rate: 0.06 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: Number.POSITIVE_INFINITY, rate: 0.103 },
    ],
    standardDeduction: { single: 8000, marriedJoint: 16050, marriedSeparate: 8000, headOfHousehold: 11200 },
    hasLocalTax: true,
    localTaxRate: 0.03876, // NYC rate
  },
  CA: {
    name: "California",
    brackets: [
      { min: 0, max: 9325, rate: 0.01 },
      { min: 9325, max: 22107, rate: 0.02 },
      { min: 22107, max: 34892, rate: 0.04 },
      { min: 34892, max: 48435, rate: 0.06 },
      { min: 48435, max: 61214, rate: 0.08 },
      { min: 61214, max: 312686, rate: 0.093 },
      { min: 312686, max: 375221, rate: 0.103 },
      { min: 375221, max: 625369, rate: 0.113 },
      { min: 625369, max: Number.POSITIVE_INFINITY, rate: 0.123 },
    ],
    standardDeduction: { single: 5202, marriedJoint: 10404, marriedSeparate: 5202, headOfHousehold: 10726 },
    hasLocalTax: false,
  },
  TX: {
    name: "Texas",
    brackets: [],
    standardDeduction: { single: 0, marriedJoint: 0, marriedSeparate: 0, headOfHousehold: 0 },
    hasLocalTax: false,
  },
  FL: {
    name: "Florida",
    brackets: [],
    standardDeduction: { single: 0, marriedJoint: 0, marriedSeparate: 0, headOfHousehold: 0 },
    hasLocalTax: false,
  },
}

// ZIP code to state mapping (simplified)
const ZIP_TO_STATE: Record<string, string> = {
  "10": "NY",
  "11": "NY",
  "12": "NY",
  "13": "NY",
  "14": "NY",
  "90": "CA",
  "91": "CA",
  "92": "CA",
  "93": "CA",
  "94": "CA",
  "95": "CA",
  "75": "TX",
  "76": "TX",
  "77": "TX",
  "78": "TX",
  "79": "TX",
  "32": "FL",
  "33": "FL",
  "34": "FL",
}

function calculateBracketTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0
  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min
      tax += taxableInThisBracket * bracket.rate
    }
  }
  return tax
}

function getStateFromZip(zipCode: string): string {
  const prefix = zipCode.substring(0, 2)
  return ZIP_TO_STATE[prefix] || "TX" // Default to Texas (no state tax)
}

export interface TaxCalculation {
  grossIncome: number
  federalTax: number
  stateTax: number
  localTax: number
  socialSecurity: number
  medicare: number
  additionalMedicare: number
  totalTaxes: number
  netIncome: number
  effectiveRate: number
  marginalRate: number
  breakdown: {
    federalEffectiveRate: number
    stateEffectiveRate: number
    localEffectiveRate: number
    payrollTaxRate: number
  }
}

export interface PaycheckViabilityResult {
  monthlyNet: number
  monthlyExpenses: number
  monthlyTaxBurden: number
  viabilityRatio: number
  surplus: number
  status: "excellent" | "good" | "adequate" | "challenging" | "insufficient"
  statusColor: string
  statusMessage: string
  recommendations: string[]
}

export function calculateTaxes(
  grossIncome: number,
  filingStatus: string,
  dependents: number,
  zipCode: string,
): TaxCalculation {
  const state = getStateFromZip(zipCode)
  const stateData = STATE_TAX_DATA[state]

  // Federal tax calculation
  const federalStandardDeduction =
    FEDERAL_STANDARD_DEDUCTIONS_2024[filingStatus as keyof typeof FEDERAL_STANDARD_DEDUCTIONS_2024]
  const federalTaxableIncome = Math.max(0, grossIncome - federalStandardDeduction)
  const federalTax = calculateBracketTax(federalTaxableIncome, FEDERAL_TAX_BRACKETS_2024[filingStatus])

  // State tax calculation
  let stateTax = 0
  if (stateData.brackets.length > 0) {
    const stateStandardDeduction = stateData.standardDeduction[filingStatus as keyof typeof stateData.standardDeduction]
    const stateTaxableIncome = Math.max(0, grossIncome - stateStandardDeduction)
    stateTax = calculateBracketTax(stateTaxableIncome, stateData.brackets)
  }

  // Local tax calculation
  let localTax = 0
  if (stateData.hasLocalTax && stateData.localTaxRate) {
    // NYC and other high-tax localities
    if (zipCode.startsWith("100") || zipCode.startsWith("101") || zipCode.startsWith("102")) {
      localTax = grossIncome * stateData.localTaxRate
    }
  }

  // Payroll taxes
  const socialSecurityWageBase = 160200 // 2024 limit
  const socialSecurity = Math.min(grossIncome, socialSecurityWageBase) * 0.062
  const medicare = grossIncome * 0.0145
  const additionalMedicare = grossIncome > 200000 ? (grossIncome - 200000) * 0.009 : 0

  const totalTaxes = federalTax + stateTax + localTax + socialSecurity + medicare + additionalMedicare
  const netIncome = grossIncome - totalTaxes
  const effectiveRate = (totalTaxes / grossIncome) * 100

  // Calculate marginal rate (simplified)
  const marginalRate = getMarginalTaxRate(grossIncome, filingStatus, state)

  return {
    grossIncome,
    federalTax,
    stateTax,
    localTax,
    socialSecurity,
    medicare,
    additionalMedicare,
    totalTaxes,
    netIncome,
    effectiveRate,
    marginalRate,
    breakdown: {
      federalEffectiveRate: (federalTax / grossIncome) * 100,
      stateEffectiveRate: (stateTax / grossIncome) * 100,
      localEffectiveRate: (localTax / grossIncome) * 100,
      payrollTaxRate: ((socialSecurity + medicare + additionalMedicare) / grossIncome) * 100,
    },
  }
}

function getMarginalTaxRate(income: number, filingStatus: string, state: string): number {
  const federalBrackets = FEDERAL_TAX_BRACKETS_2024[filingStatus]
  const stateBrackets = STATE_TAX_DATA[state]?.brackets || []

  let federalMarginal = 0
  let stateMarginal = 0

  for (const bracket of federalBrackets) {
    if (income > bracket.min && income <= bracket.max) {
      federalMarginal = bracket.rate
      break
    }
  }

  for (const bracket of stateBrackets) {
    if (income > bracket.min && income <= bracket.max) {
      stateMarginal = bracket.rate
      break
    }
  }

  return (federalMarginal + stateMarginal) * 100
}

export function calculatePaycheckViability(
  taxCalculation: TaxCalculation,
  monthlyExpenses: number,
): PaycheckViabilityResult {
  const monthlyNet = taxCalculation.netIncome / 12
  const monthlyTaxBurden = taxCalculation.totalTaxes / 12
  const viabilityRatio = monthlyNet / monthlyExpenses
  const surplus = monthlyNet - monthlyExpenses

  let status: PaycheckViabilityResult["status"]
  let statusColor: string
  let statusMessage: string
  let recommendations: string[]

  if (viabilityRatio >= 2.0) {
    status = "excellent"
    statusColor = "text-green-600"
    statusMessage = "Excellent financial position with strong savings potential"
    recommendations = [
      "Consider maximizing retirement contributions",
      "Build emergency fund (6+ months expenses)",
      "Explore investment opportunities",
      "Consider increasing insurance coverage",
    ]
  } else if (viabilityRatio >= 1.5) {
    status = "good"
    statusColor = "text-blue-600"
    statusMessage = "Good financial stability with room for savings"
    recommendations = [
      "Build emergency fund (3-6 months expenses)",
      "Increase retirement contributions",
      "Consider debt payoff strategies",
      "Review and optimize monthly expenses",
    ]
  } else if (viabilityRatio >= 1.2) {
    status = "adequate"
    statusColor = "text-yellow-600"
    statusMessage = "Adequate income but limited savings capacity"
    recommendations = [
      "Focus on building small emergency fund",
      "Look for ways to reduce monthly expenses",
      "Consider side income opportunities",
      "Review subscription services and recurring costs",
    ]
  } else if (viabilityRatio >= 1.0) {
    status = "challenging"
    statusColor = "text-orange-600"
    statusMessage = "Challenging situation - breaking even with little buffer"
    recommendations = [
      "Urgently review and cut non-essential expenses",
      "Look for additional income sources",
      "Consider relocating to lower cost area",
      "Seek financial counseling assistance",
    ]
  } else {
    status = "insufficient"
    statusColor = "text-red-600"
    statusMessage = "Insufficient income to cover basic living expenses"
    recommendations = [
      "Immediate action needed - seek higher paying work",
      "Apply for assistance programs",
      "Consider relocating to much lower cost area",
      "Drastically reduce expenses where possible",
    ]
  }

  return {
    monthlyNet,
    monthlyExpenses,
    monthlyTaxBurden,
    viabilityRatio,
    surplus,
    status,
    statusColor,
    statusMessage,
    recommendations,
  }
}
