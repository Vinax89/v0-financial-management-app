import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid"

// Plaid configuration
const configuration = new Configuration({
  basePath:
    process.env.PLAID_ENV === "production"
      ? PlaidEnvironments.production
      : process.env.PLAID_ENV === "development"
        ? PlaidEnvironments.development
        : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// Plaid configuration constants
export const PLAID_PRODUCTS = [Products.Transactions, Products.Accounts, Products.Identity] as Products[]

export const PLAID_COUNTRY_CODES = [CountryCode.Us] as CountryCode[]

// Helper functions for Plaid integration
export const plaidConfig = {
  products: PLAID_PRODUCTS,
  countryCodes: PLAID_COUNTRY_CODES,
  clientName: process.env.PLAID_CLIENT_NAME || "ShiftBudget",
  language: "en",
  webhook: process.env.PLAID_WEBHOOK_URL,
  linkCustomizationName: process.env.PLAID_LINK_CUSTOMIZATION_NAME,
}

// Error handling utilities
export const isPlaidError = (error: any): boolean => {
  return error?.response?.data?.error_code !== undefined
}

export const getPlaidErrorMessage = (error: any): string => {
  if (isPlaidError(error)) {
    return error.response.data.error_message || "Unknown Plaid error"
  }
  return error.message || "Unknown error"
}

export const getPlaidErrorCode = (error: any): string | null => {
  if (isPlaidError(error)) {
    return error.response.data.error_code
  }
  return null
}

// Transaction categorization mapping
export const mapPlaidCategoryToLocal = (plaidCategories: string[]): string => {
  if (!plaidCategories || plaidCategories.length === 0) return "Other"

  const primaryCategory = plaidCategories[0].toLowerCase()

  const categoryMap: Record<string, string> = {
    "food and drink": "Food & Dining",
    shops: "Shopping",
    transportation: "Transportation",
    recreation: "Entertainment",
    service: "Bills & Utilities",
    healthcare: "Healthcare",
    deposit: "Income",
    transfer: "Transfer",
    payment: "Bills & Utilities",
  }

  return categoryMap[primaryCategory] || "Other"
}

// Personal Finance Category mapping (Plaid's enhanced categorization)
export const mapPersonalFinanceCategory = (primary: string, detailed: string): string => {
  const categoryMap: Record<string, string> = {
    INCOME: "Income",
    TRANSFER_IN: "Transfer In",
    TRANSFER_OUT: "Transfer Out",
    LOAN_PAYMENTS: "Loan Payments",
    BANK_FEES: "Bank Fees",
    ENTERTAINMENT: "Entertainment",
    FOOD_AND_DRINK: "Food & Dining",
    GENERAL_MERCHANDISE: "Shopping",
    HOME_IMPROVEMENT: "Home & Garden",
    MEDICAL: "Healthcare",
    PERSONAL_CARE: "Personal Care",
    GENERAL_SERVICES: "Services",
    GOVERNMENT_AND_NON_PROFIT: "Government & Non-Profit",
    TRANSPORTATION: "Transportation",
    TRAVEL: "Travel",
    RENT_AND_UTILITIES: "Bills & Utilities",
  }

  return categoryMap[primary] || "Other"
}

// Account type mapping
export const mapPlaidAccountType = (type: string, subtype?: string): string => {
  const typeMap: Record<string, string> = {
    depository: subtype === "checking" ? "Checking" : subtype === "savings" ? "Savings" : "Bank Account",
    credit: "Credit Card",
    loan: "Loan",
    investment: "Investment",
    other: "Other",
  }

  return typeMap[type] || "Other"
}

// Format currency amounts
export const formatPlaidAmount = (amount: number, isoCurrencyCode?: string): string => {
  const currency = isoCurrencyCode || "USD"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Date utilities
export const formatPlaidDate = (date: string): Date => {
  return new Date(date + "T00:00:00.000Z")
}

export const isRecentTransaction = (date: string, days = 30): boolean => {
  const transactionDate = new Date(date)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  return transactionDate >= cutoffDate
}

// Webhook verification
export const verifyPlaidWebhook = (requestBody: string, headers: Record<string, string>): boolean => {
  // Implement webhook verification logic here
  // This would typically involve verifying the webhook signature
  // For now, we'll return true (implement proper verification in production)
  return true
}
