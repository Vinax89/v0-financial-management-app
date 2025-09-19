export interface ChartTooltipPayload {
  color: string
  name: string
  value: number
  dataKey: string
  payload?: Record<string, unknown>
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string
}

export interface CashFlowData {
  month: string
  income: number
  expenses: number
  cashFlow: number
}

export interface SpendingData {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface NetWorthData {
  date: string
  assets: number
  liabilities: number
  netWorth: number
}

export interface BudgetProgressData {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}
