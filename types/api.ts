export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PlaidWebhookPayload {
  webhook_type: string
  webhook_code: string
  item_id: string
  error?: {
    error_type: string
    error_code: string
    error_message: string
  }
  new_transactions?: number
  removed_transactions?: string[]
}

export interface PlaidAccount {
  id: string
  name: string
  type: string
  subtype: string
  mask: string
  balance: number
}

export interface PlaidTransaction {
  id: string
  account_id: string
  amount: number
  date: string
  name: string
  merchant_name?: string
  category: string[]
  pending: boolean
}
