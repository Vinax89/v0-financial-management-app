import { createClient } from "@/lib/supabase/client"
import { debounce } from "lodash-es"

export interface FinancialData {
  income: number
  expenses: number
  taxes: {
    federal: number
    state: number
    local: number
    payroll: number
    total: number
  }
  netIncome: number
  monthlyBudget: number
  savingsRate: number
  debtToIncomeRatio: number
  emergencyFundMonths: number
  projectedAnnualSavings: number
}

export interface TaxCalculationInputs {
  grossIncome: number
  filingStatus: "single" | "married_joint" | "married_separate" | "head_of_household"
  state: string
  zipCode?: string
  deductions: number
  exemptions: number
}

export interface BudgetInputs {
  monthlyIncome: number
  fixedExpenses: number
  variableExpenses: number
  savingsGoal: number
  emergencyFund: number
  debts: Array<{
    name: string
    balance: number
    minimumPayment: number
    interestRate: number
  }>
}

export class RealTimeCalculator {
  private supabase
  private calculationCache = new Map<string, any>()
  private listeners = new Set<(data: FinancialData) => void>()

  constructor() {
    this.supabase = createClient()
  }

  // Debounced calculation to avoid excessive API calls
  private debouncedCalculate = debounce(async (inputs: any) => {
    const result = await this.performCalculations(inputs)
    this.notifyListeners(result)
  }, 300)

  subscribe(callback: (data: FinancialData) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(data: FinancialData) {
    this.listeners.forEach((callback) => callback(data))
  }

  async calculateTaxes(inputs: TaxCalculationInputs): Promise<FinancialData["taxes"]> {
    const cacheKey = JSON.stringify(inputs)
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)
    }

    try {
      // Fetch tax brackets from database
      const { data: federalBrackets } = await this.supabase
        .from("tax_brackets")
        .select("*")
        .eq("year", new Date().getFullYear())
        .eq("filing_status", inputs.filingStatus)
        .eq("tax_type", "federal")
        .order("bracket_min")

      const { data: stateBrackets } = await this.supabase
        .from("tax_brackets")
        .select("*")
        .eq("year", new Date().getFullYear())
        .eq("filing_status", inputs.filingStatus)
        .eq("tax_type", "state")
        .eq("jurisdiction", inputs.state)
        .order("bracket_min")

      const { data: payrollRates } = await this.supabase
        .from("payroll_tax_rates")
        .select("*")
        .eq("year", new Date().getFullYear())
        .single()

      // Calculate federal taxes
      const federalTax = this.calculateProgressiveTax(inputs.grossIncome - inputs.deductions, federalBrackets || [])

      // Calculate state taxes
      const stateTax = this.calculateProgressiveTax(inputs.grossIncome - inputs.deductions, stateBrackets || [])

      // Calculate payroll taxes
      const payrollTax = this.calculatePayrollTaxes(inputs.grossIncome, payrollRates)

      // Get local taxes if zip code provided
      let localTax = 0
      if (inputs.zipCode) {
        const { data: localRates } = await this.supabase
          .from("local_tax_rates")
          .select("local_income_tax_rate")
          .eq("zip_code", inputs.zipCode)
          .eq("year", new Date().getFullYear())
          .single()

        if (localRates?.local_income_tax_rate) {
          localTax = inputs.grossIncome * localRates.local_income_tax_rate
        }
      }

      const result = {
        federal: federalTax,
        state: stateTax,
        local: localTax,
        payroll: payrollTax,
        total: federalTax + stateTax + localTax + payrollTax,
      }

      this.calculationCache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error("Tax calculation error:", error)
      return {
        federal: 0,
        state: 0,
        local: 0,
        payroll: 0,
        total: 0,
      }
    }
  }

  private calculateProgressiveTax(taxableIncome: number, brackets: any[]): number {
    let tax = 0
    let remainingIncome = taxableIncome

    for (const bracket of brackets) {
      const bracketMin = bracket.bracket_min
      const bracketMax = bracket.bracket_max || Number.POSITIVE_INFINITY
      const rate = bracket.rate

      if (remainingIncome <= 0) break

      const taxableInThisBracket = Math.min(remainingIncome, bracketMax - bracketMin)

      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * rate
        remainingIncome -= taxableInThisBracket
      }
    }

    return tax
  }

  private calculatePayrollTaxes(grossIncome: number, rates: any): number {
    if (!rates) return 0

    let payrollTax = 0

    // Social Security tax (up to wage base)
    const socialSecurityWages = Math.min(grossIncome, rates.social_security_wage_base)
    payrollTax += socialSecurityWages * rates.social_security_rate

    // Medicare tax (all wages)
    payrollTax += grossIncome * rates.medicare_rate

    // Additional Medicare tax (over threshold)
    if (grossIncome > rates.additional_medicare_threshold) {
      const additionalMedicareWages = grossIncome - rates.additional_medicare_threshold
      payrollTax += additionalMedicareWages * rates.additional_medicare_rate
    }

    return payrollTax
  }

  async calculateBudgetMetrics(inputs: BudgetInputs): Promise<Partial<FinancialData>> {
    const totalMonthlyExpenses = inputs.fixedExpenses + inputs.variableExpenses
    const totalDebtPayments = inputs.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalExpenses = totalMonthlyExpenses + totalDebtPayments

    const netIncome = inputs.monthlyIncome - totalExpenses
    const savingsRate = inputs.monthlyIncome > 0 ? (netIncome / inputs.monthlyIncome) * 100 : 0
    const debtToIncomeRatio = inputs.monthlyIncome > 0 ? (totalDebtPayments / inputs.monthlyIncome) * 100 : 0
    const emergencyFundMonths = totalExpenses > 0 ? inputs.emergencyFund / totalExpenses : 0
    const projectedAnnualSavings = Math.max(0, netIncome * 12)

    return {
      netIncome,
      monthlyBudget: totalExpenses,
      savingsRate,
      debtToIncomeRatio,
      emergencyFundMonths,
      projectedAnnualSavings,
    }
  }

  async performCalculations(inputs: {
    tax: TaxCalculationInputs
    budget: BudgetInputs
  }): Promise<FinancialData> {
    const [taxes, budgetMetrics] = await Promise.all([
      this.calculateTaxes(inputs.tax),
      this.calculateBudgetMetrics(inputs.budget),
    ])

    const grossAnnualIncome = inputs.tax.grossIncome
    const netAnnualIncome = grossAnnualIncome - taxes.total

    return {
      income: grossAnnualIncome,
      expenses: budgetMetrics.monthlyBudget! * 12,
      taxes,
      netIncome: netAnnualIncome,
      monthlyBudget: budgetMetrics.monthlyBudget!,
      savingsRate: budgetMetrics.savingsRate!,
      debtToIncomeRatio: budgetMetrics.debtToIncomeRatio!,
      emergencyFundMonths: budgetMetrics.emergencyFundMonths!,
      projectedAnnualSavings: budgetMetrics.projectedAnnualSavings!,
    }
  }

  // Trigger real-time calculation
  async updateCalculations(inputs: {
    tax: TaxCalculationInputs
    budget: BudgetInputs
  }) {
    this.debouncedCalculate(inputs)
  }

  // Clear cache when tax data is updated
  clearCache() {
    this.calculationCache.clear()
  }
}

// Singleton instance
export const realTimeCalculator = new RealTimeCalculator()
