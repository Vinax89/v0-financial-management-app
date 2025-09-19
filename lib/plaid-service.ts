import { plaidClient, mapPlaidCategoryToLocal, mapPersonalFinanceCategory } from "./plaid-client"
import { getSupabaseServerClient } from "./supabase/server"
import { encryptToString, decryptFromString } from "@/lib/crypto/encryption"
import type {
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
  TransactionsSyncRequest,
  ItemGetRequest,
  ItemRemoveRequest,
} from "plaid"

export class PlaidService {
  private supabasePromise = getSupabaseServerClient()
  private async supabase() { return await this.supabasePromise }

  // Create Link Token for Plaid Link
  async createLinkToken(userId: string): Promise<string> {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: userId,
        },
        client_name: "ShiftBudget",
        products: ["transactions", "accounts"],
        country_codes: ["US"],
        language: "en",
        webhook: process.env.PLAID_WEBHOOK_URL,
      }

      const response = await plaidClient.linkTokenCreate(request)
      return response.data.link_token
    } catch (error) {
      console.error("Failed to create link token:", error)
      throw new Error("Failed to create link token")
    }
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string, userId: string): Promise<string> {
    try {
      const request: ItemPublicTokenExchangeRequest = {
        public_token: publicToken,
      }

      const response = await plaidClient.itemPublicTokenExchange(request)
      const { access_token, item_id } = response.data

      // Get institution info
      const itemRequest: ItemGetRequest = { access_token }
      const itemResponse = await plaidClient.itemGet(itemRequest)
      const institution = itemResponse.data.institution

      const encrypted_access_token = encryptToString(access_token)

      // Store the item in database
      const { data: plaidItem, error } = await (await this.supabase())
        .from("plaid_items")
        .insert([
          {
            user_id: userId,
            item_id,
            access_token: encrypted_access_token,
            institution_id: institution?.institution_id,
            institution_name: institution?.name,
            status: "active",
            available_products: itemResponse.data.item.available_products,
            billed_products: itemResponse.data.item.billed_products,
            consent_expiration_time: itemResponse.data.item.consent_expiration_time,
            update_type: itemResponse.data.item.update_type,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Fetch and store accounts
      await this.syncAccounts(access_token, plaidItem.id)

      // Initial transaction sync
      await this.syncTransactions(access_token, plaidItem.id)

      return item_id
    } catch (error) {
      console.error("Failed to exchange public token:", error)
      throw new Error("Failed to connect bank account")
    }
  }

  // Sync accounts from Plaid
  async syncAccounts(accessToken: string, plaidItemId: string): Promise<void> {
    try {
      const request: AccountsGetRequest = {
        access_token: accessToken,
      }

      const response = await plaidClient.accountsGet(request)
      const accounts = response.data.accounts

      for (const account of accounts) {
        const accountData = {
          plaid_item_id: plaidItemId,
          account_id: account.account_id,
          name: account.name,
          official_name: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          verification_status: account.verification_status,
          available_balance: account.balances.available,
          current_balance: account.balances.current,
          limit_amount: account.balances.limit,
          iso_currency_code: account.balances.iso_currency_code,
          unofficial_currency_code: account.balances.unofficial_currency_code,
          last_balance_update: new Date().toISOString(),
        }

        await (await this.supabase()).from("plaid_accounts").upsert(accountData, {
          onConflict: "plaid_item_id,account_id",
        })
      }
    } catch (error) {
      console.error("Failed to sync accounts:", error)
      throw new Error("Failed to sync accounts")
    }
  }

  // Sync transactions from Plaid
  async syncTransactions(accessToken: string, plaidItemId: string): Promise<void> {
    try {
      // Check if we have a cursor for incremental sync
      const { data: syncCursor } = await (await this.supabase())
        .from("plaid_sync_cursors")
        .select("cursor")
        .eq("plaid_item_id", plaidItemId)
        .single()

      if (syncCursor?.cursor) {
        // Use incremental sync
        await this.incrementalTransactionSync(accessToken, plaidItemId, syncCursor.cursor)
      } else {
        // Initial full sync
        await this.fullTransactionSync(accessToken, plaidItemId)
      }
    } catch (error) {
      console.error("Failed to sync transactions:", error)
      throw new Error("Failed to sync transactions")
    }
  }

  // Full transaction sync (initial sync)
  private async fullTransactionSync(accessToken: string, plaidItemId: string): Promise<void> {
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2) // Get 2 years of history

    const endDate = new Date()

    let offset = 0
    const count = 500 // Max transactions per request

    while (true) {
      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        offset,
        count,
      }

      const response = await plaidClient.transactionsGet(request)
      const transactions = response.data.transactions

      if (transactions.length === 0) break

      await this.storeTransactions(transactions, plaidItemId)

      offset += transactions.length

      // If we got fewer transactions than requested, we're done
      if (transactions.length < count) break
    }
  }

  // Incremental transaction sync using cursors
  private async incrementalTransactionSync(accessToken: string, plaidItemId: string, cursor: string): Promise<void> {
    let nextCursor = cursor

    while (nextCursor) {
      const request: TransactionsSyncRequest = {
        access_token: accessToken,
        cursor: nextCursor,
        count: 500,
      }

      const response = await plaidClient.transactionsSync(request)
      const { added, modified, removed, next_cursor, has_more } = response.data

      // Store new and modified transactions
      if (added.length > 0) {
        await this.storeTransactions(added, plaidItemId)
      }

      if (modified.length > 0) {
        await this.storeTransactions(modified, plaidItemId)
      }

      // Handle removed transactions
      if (removed.length > 0) {
        await this.removeTransactions(removed.map((r) => r.transaction_id))
      }

      // Update cursor
      await (await this.supabase()).from("plaid_sync_cursors").upsert({
        plaid_item_id: plaidItemId,
        cursor: next_cursor,
        last_sync: new Date().toISOString(),
      })

      nextCursor = has_more ? next_cursor : null
    }
  }

  // Store transactions in database
  private async storeTransactions(transactions: any[], plaidItemId: string): Promise<void> {
    // Get account mappings
    const { data: accounts } = await (await this.supabase())
      .from("plaid_accounts")
      .select("id, account_id")
      .eq("plaid_item_id", plaidItemId)

    const accountMap = new Map(accounts?.map((a) => [a.account_id, a.id]) || [])

    const transactionData = transactions.map((transaction) => ({
      plaid_account_id: accountMap.get(transaction.account_id),
      transaction_id: transaction.transaction_id,
      amount: transaction.amount,
      iso_currency_code: transaction.iso_currency_code,
      unofficial_currency_code: transaction.unofficial_currency_code,
      date: transaction.date,
      datetime: transaction.datetime,
      authorized_date: transaction.authorized_date,
      authorized_datetime: transaction.authorized_datetime,
      name: transaction.name,
      merchant_name: transaction.merchant_name,
      original_description: transaction.original_description,
      category: transaction.category,
      category_id: transaction.category_id,
      detailed_category: transaction.category?.[transaction.category.length - 1],
      confidence_level: transaction.category_confidence_level,
      account_owner: transaction.account_owner,
      pending: transaction.pending,
      pending_transaction_id: transaction.pending_transaction_id,
      transaction_type: transaction.transaction_type,
      transaction_code: transaction.transaction_code,
      location_address: transaction.location?.address,
      location_city: transaction.location?.city,
      location_region: transaction.location?.region,
      location_postal_code: transaction.location?.postal_code,
      location_country: transaction.location?.country,
      location_lat: transaction.location?.lat,
      location_lon: transaction.location?.lon,
      payment_method: transaction.payment_meta?.payment_method,
      payment_channel: transaction.payment_meta?.payment_channel,
      by_order_of: transaction.payment_meta?.by_order_of,
      payee: transaction.payment_meta?.payee,
      payer: transaction.payment_meta?.payer,
      payment_processor: transaction.payment_meta?.payment_processor,
      ppd_id: transaction.payment_meta?.ppd_id,
      reason: transaction.payment_meta?.reason,
      reference_number: transaction.payment_meta?.reference_number,
      personal_finance_category_primary: transaction.personal_finance_category?.primary,
      personal_finance_category_detailed: transaction.personal_finance_category?.detailed,
      personal_finance_category_confidence_level: transaction.personal_finance_category?.confidence_level,
    }))

    await (await this.supabase()).from("plaid_transactions").upsert(transactionData, {
      onConflict: "transaction_id",
    })

    // Sync to main transactions table
    await this.syncToMainTransactions(transactionData)
  }

  // Remove transactions
  private async removeTransactions(transactionIds: string[]): Promise<void> {
    await (await this.supabase()).from("plaid_transactions").delete().in("transaction_id", transactionIds)
  }

  // Sync Plaid transactions to main transactions table
  private async syncToMainTransactions(plaidTransactions: any[]): Promise<void> {
    for (const plaidTx of plaidTransactions) {
      // Skip if already synced
      if (plaidTx.is_synced_to_transactions) continue

      try {
        // Get account info
        const { data: account } = await (await this.supabase())
          .from("plaid_accounts")
          .select("name, type, subtype")
          .eq("id", plaidTx.plaid_account_id)
          .single()

        // Map to main transaction format
        const mainTransaction = {
          amount: -plaidTx.amount, // Plaid amounts are positive for debits, negative for credits
          description: plaidTx.name,
          date: plaidTx.date,
          category: this.mapCategory(plaidTx),
          account: account?.name || "Unknown Account",
          source: "plaid",
          source_id: plaidTx.transaction_id,
          merchant_name: plaidTx.merchant_name,
          location: this.formatLocation(plaidTx),
          is_pending: plaidTx.pending,
          metadata: {
            plaid_category: plaidTx.category,
            plaid_category_id: plaidTx.category_id,
            personal_finance_category: {
              primary: plaidTx.personal_finance_category_primary,
              detailed: plaidTx.personal_finance_category_detailed,
            },
            payment_channel: plaidTx.payment_channel,
            transaction_type: plaidTx.transaction_type,
          },
        }

        // Insert into main transactions table
        const { data: insertedTx, error } = await (await this.supabase())
          .from("transactions")
          .insert([mainTransaction])
          .select()
          .single()

        if (error) throw error

        // Update Plaid transaction as synced
        await (await this.supabase())
          .from("plaid_transactions")
          .update({
            is_synced_to_transactions: true,
            local_transaction_id: insertedTx.id,
          })
          .eq("transaction_id", plaidTx.transaction_id)
      } catch (error) {
        console.error(`Failed to sync transaction ${plaidTx.transaction_id}:`, error)

        // Log sync error
        await (await this.supabase())
          .from("plaid_transactions")
          .update({
            sync_error: error instanceof Error ? error.message : "Unknown sync error",
          })
          .eq("transaction_id", plaidTx.transaction_id)
      }
    }
  }

  // Map Plaid category to local category
  private mapCategory(plaidTransaction: any): string {
    if (plaidTransaction.personal_finance_category_primary) {
      return mapPersonalFinanceCategory(
        plaidTransaction.personal_finance_category_primary,
        plaidTransaction.personal_finance_category_detailed,
      )
    }

    if (plaidTransaction.category) {
      return mapPlaidCategoryToLocal(plaidTransaction.category)
    }

    return "Other"
  }

  // Format location information
  private formatLocation(plaidTransaction: any): string | null {
    if (!plaidTransaction.location_address && !plaidTransaction.location_city) {
      return null
    }

    const parts = [
      plaidTransaction.location_address,
      plaidTransaction.location_city,
      plaidTransaction.location_region,
    ].filter(Boolean)

    return parts.join(", ")
  }

  // Get connected accounts for a user
  async getConnectedAccounts(userId: string): Promise<any[]> {
    const { data, error } = await (await this.supabase())
      .from("plaid_items")
      .select(`
        *,
        plaid_accounts ( 
          *
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")

    if (error) throw error
    return data || []
  }

  // Remove Plaid item (disconnect bank)
  async removeItem(itemId: string, userId: string): Promise<void> {
    try {
      // Get access token
      const { data: plaidItem } = await (await this.supabase())
        .from("plaid_items")
        .select("access_token")
        .eq("item_id", itemId)
        .eq("user_id", userId)
        .single()

      if (!plaidItem) throw new Error("Item not found")

      const accessToken = decryptFromString(plaidItem.access_token)

      // Remove from Plaid
      const request: ItemRemoveRequest = {
        access_token: accessToken,
      }

      await plaidClient.itemRemove(request)

      // Remove from database (cascade will handle related records)
      await (await this.supabase()).from("plaid_items").delete().eq("item_id", itemId).eq("user_id", userId)
    } catch (error) {
      console.error("Failed to remove Plaid item:", error)
      throw new Error("Failed to disconnect bank account")
    }
  }

  // Handle webhook
  async handleWebhook(webhookType: string, webhookCode: string, payload: any): Promise<void> {
    try {
      // Log webhook
      await (await this.supabase()).from("plaid_webhooks").insert([
        {
          webhook_type: webhookType,
          webhook_code: webhookCode,
          item_id: payload.item_id,
          error_code: payload.error?.error_code,
          error_message: payload.error?.error_message,
          new_transactions: payload.new_transactions || 0,
          removed_transactions: payload.removed_transactions || [],
          payload,
        },
      ])

      // Handle different webhook types
      switch (webhookType) {
        case "TRANSACTIONS":
          await this.handleTransactionsWebhook(webhookCode, payload)
          break
        case "ITEM":
          await this.handleItemWebhook(webhookCode, payload)
          break
        case "ACCOUNTS":
          await this.handleAccountsWebhook(webhookCode, payload)
          break
        default:
          console.log(`Unhandled webhook type: ${webhookType}`)
      }

      // Mark webhook as processed
      await (await this.supabase())
        .from("plaid_webhooks")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("item_id", payload.item_id)
        .eq("webhook_type", webhookType)
        .eq("webhook_code", webhookCode)
    } catch (error) {
      console.error("Failed to handle webhook:", error)
    }
  }

  // Handle transaction webhooks
  private async handleTransactionsWebhook(webhookCode: string, payload: any): Promise<void> {
    const { item_id } = payload

    // Get Plaid item
    const { data: plaidItem } = await (await this.supabase())
      .from("plaid_items")
      .select("id, access_token")
      .eq("item_id", item_id)
      .single()

    if (!plaidItem) return

    const accessToken = decryptFromString(plaidItem.access_token)

    switch (webhookCode) {
      case "SYNC_UPDATES_AVAILABLE":
      case "DEFAULT_UPDATE":
      case "INITIAL_UPDATE":
        // Sync transactions
        await this.syncTransactions(accessToken, plaidItem.id)
        break
      case "HISTORICAL_UPDATE":
        // Full historical sync
        await this.fullTransactionSync(accessToken, plaidItem.id)
        break
      default:
        console.log(`Unhandled transaction webhook code: ${webhookCode}`)
    }
  }

  // Handle item webhooks
  private async handleItemWebhook(webhookCode: string, payload: any): Promise<void> {
    const { item_id, error } = payload

    switch (webhookCode) {
      case "ERROR":
        // Update item status
        await (await this.supabase())
          .from("plaid_items")
          .update({
            status: "error",
            error_code: error?.error_code,
            error_message: error?.error_message,
          })
          .eq("item_id", item_id)
        break
      case "PENDING_EXPIRATION":
        // Update item status
        await (await this.supabase())
          .from("plaid_items")
          .update({
            status: "requires_update",
            update_type: "user_present_required",
          })
          .eq("item_id", item_id)
        break
      default:
        console.log(`Unhandled item webhook code: ${webhookCode}`)
    }
  }

  // Handle account webhooks
  private async handleAccountsWebhook(webhookCode: string, payload: any): Promise<void> {
    const { item_id } = payload

    // Get Plaid item
    const { data: plaidItem } = await (await this.supabase())
      .from("plaid_items")
      .select("id, access_token")
      .eq("item_id", item_id)
      .single()

    if (!plaidItem) return

    const accessToken = decryptFromString(plaidItem.access_token)

    switch (webhookCode) {
      case "DEFAULT_UPDATE":
        // Sync accounts
        await this.syncAccounts(accessToken, plaidItem.id)
        break
      default:
        console.log(`Unhandled accounts webhook code: ${webhookCode}`)
    }
  }
}

// Export singleton instance
export const plaidService = new PlaidService()
