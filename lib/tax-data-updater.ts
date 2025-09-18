import { createClient } from "@/lib/supabase/server"

interface TaxBracket {
  year: number
  filing_status: string
  bracket_min: number
  bracket_max: number | null
  rate: number
  tax_type: string
  jurisdiction?: string
}

interface PayrollTaxRates {
  year: number
  social_security_rate: number
  medicare_rate: number
  additional_medicare_rate: number
  social_security_wage_base: number
  additional_medicare_threshold: number
  unemployment_rate: number
  unemployment_wage_base: number
}

export class TaxDataUpdater {
  private supabase

  constructor() {
    this.supabase = null
  }

  async initialize() {
    this.supabase = await createClient()
  }

  // Fetch latest tax data from IRS and other government sources
  async fetchLatestTaxData(year: number = new Date().getFullYear()) {
    try {
      // In a real implementation, this would fetch from official APIs
      // For now, we'll simulate with the latest known data
      const federalBrackets = await this.getFederalTaxBrackets(year)
      const payrollRates = await this.getPayrollTaxRates(year)
      const stateData = await this.getStateData(year)

      return {
        federalBrackets,
        payrollRates,
        stateData,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error fetching tax data:", error)
      throw error
    }
  }

  private async getFederalTaxBrackets(year: number): Promise<TaxBracket[]> {
    // This would typically fetch from IRS API or scrape official sources
    // For 2024 tax brackets (filing in 2025)
    return [
      // Single filers
      { year, filing_status: "single", bracket_min: 0, bracket_max: 11600, rate: 0.1, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 11600, bracket_max: 47150, rate: 0.12, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 47150, bracket_max: 100525, rate: 0.22, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 100525, bracket_max: 191950, rate: 0.24, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 191950, bracket_max: 243725, rate: 0.32, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 243725, bracket_max: 609350, rate: 0.35, tax_type: "federal" },
      { year, filing_status: "single", bracket_min: 609350, bracket_max: null, rate: 0.37, tax_type: "federal" },

      // Married filing jointly
      { year, filing_status: "married_joint", bracket_min: 0, bracket_max: 23200, rate: 0.1, tax_type: "federal" },
      { year, filing_status: "married_joint", bracket_min: 23200, bracket_max: 94300, rate: 0.12, tax_type: "federal" },
      {
        year,
        filing_status: "married_joint",
        bracket_min: 94300,
        bracket_max: 201050,
        rate: 0.22,
        tax_type: "federal",
      },
      {
        year,
        filing_status: "married_joint",
        bracket_min: 201050,
        bracket_max: 383900,
        rate: 0.24,
        tax_type: "federal",
      },
      {
        year,
        filing_status: "married_joint",
        bracket_min: 383900,
        bracket_max: 487450,
        rate: 0.32,
        tax_type: "federal",
      },
      {
        year,
        filing_status: "married_joint",
        bracket_min: 487450,
        bracket_max: 731200,
        rate: 0.35,
        tax_type: "federal",
      },
      { year, filing_status: "married_joint", bracket_min: 731200, bracket_max: null, rate: 0.37, tax_type: "federal" },
    ]
  }

  private async getPayrollTaxRates(year: number): Promise<PayrollTaxRates> {
    // This would fetch from SSA and other official sources
    return {
      year,
      social_security_rate: 0.062,
      medicare_rate: 0.0145,
      additional_medicare_rate: 0.009,
      social_security_wage_base: 176100, // 2025 estimate
      additional_medicare_threshold: 200000,
      unemployment_rate: 0.006,
      unemployment_wage_base: 7000,
    }
  }

  private async getStateData(year: number) {
    // This would fetch from state revenue departments
    return [
      { state_code: "CA", state_name: "California", has_income_tax: true, standard_deduction: 5202, year },
      { state_code: "TX", state_name: "Texas", has_income_tax: false, standard_deduction: 0, year },
      { state_code: "FL", state_name: "Florida", has_income_tax: false, standard_deduction: 0, year },
      { state_code: "NY", state_name: "New York", has_income_tax: true, standard_deduction: 8000, year },
      { state_code: "WA", state_name: "Washington", has_income_tax: false, standard_deduction: 0, year },
    ]
  }

  async updateTaxDatabase(year: number = new Date().getFullYear()) {
    if (!this.supabase) await this.initialize()

    try {
      const latestData = await this.fetchLatestTaxData(year)

      // Update federal tax brackets
      await this.supabase.from("tax_brackets").delete().eq("year", year).eq("tax_type", "federal")

      await this.supabase.from("tax_brackets").insert(latestData.federalBrackets)

      // Update payroll tax rates
      await this.supabase.from("payroll_tax_rates").delete().eq("year", year)

      await this.supabase.from("payroll_tax_rates").insert(latestData.payrollRates)

      // Update state data
      await this.supabase.from("state_tax_info").delete().eq("year", year)

      await this.supabase.from("state_tax_info").insert(latestData.stateData)

      return {
        success: true,
        message: `Tax data updated successfully for ${year}`,
        lastUpdated: latestData.lastUpdated,
      }
    } catch (error) {
      console.error("Error updating tax database:", error)
      throw error
    }
  }

  async getLastUpdateTime(year: number = new Date().getFullYear()) {
    if (!this.supabase) await this.initialize()

    const { data } = await this.supabase
      .from("tax_brackets")
      .select("updated_at")
      .eq("year", year)
      .eq("tax_type", "federal")
      .order("updated_at", { ascending: false })
      .limit(1)

    return data?.[0]?.updated_at || null
  }
}
