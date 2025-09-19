import { createClient } from "@/lib/supabase/server"

export class DatabaseOptimizer {
  private supabase
  private queryCache = new Map<string, { data: any; expires: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.supabase = null
  }

  async initialize() {
    this.supabase = await createClient()
  }

  // Intelligent query caching
  async cachedQuery<T>(cacheKey: string, queryFn: () => Promise<T>, customTTL?: number): Promise<T> {
    const now = Date.now()
    const cached = this.queryCache.get(cacheKey)

    if (cached && cached.expires > now) {
      return cached.data
    }

    const startTime = performance.now()
    const data = await queryFn()
    const executionTime = performance.now() - startTime

    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`Slow query detected: ${cacheKey} took ${executionTime.toFixed(2)}ms`)
      await this.logQueryPerformance(cacheKey, executionTime)
    }

    const ttl = customTTL || this.CACHE_DURATION
    this.queryCache.set(cacheKey, {
      data,
      expires: now + ttl,
    })

    return data
  }

  // Batch operations for better performance
  async batchInsertTransactions(transactions: any[]) {
    if (!this.supabase) await this.initialize()

    const batchSize = 100
    const results = []

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const { data, error } = await this.supabase.from("transactions").insert(batch).select()

      if (error) throw error
      results.push(...(data || []))
    }

    // Refresh materialized views after bulk insert
    await this.refreshMaterializedViews()
    return results
  }

  // Optimized transaction queries with proper indexing
  async getTransactionsByDateRange(accountId: string, startDate: string, endDate: string, limit = 100) {
    if (!this.supabase) await this.initialize()

    const cacheKey = `transactions_${accountId}_${startDate}_${endDate}_${limit}`

    return this.cachedQuery(cacheKey, async () => {
      const { data, error } = await this.supabase
        .from("transactions")
        .select(
          `
          *,
          categories(name, icon, color),
          accounts(name, type)
        `,
        )
        .eq("account_id", accountId)
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate)
        .eq("status", "completed")
        .order("transaction_date", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    })
  }

  // Use materialized views for dashboard data
  async getDashboardSummary(accountIds: string[]) {
    if (!this.supabase) await this.initialize()

    const cacheKey = `dashboard_${accountIds.join("_")}`

    return this.cachedQuery(
      cacheKey,
      async () => {
        // Use materialized view for better performance
        const { data: balances, error: balanceError } = await this.supabase
          .from("account_balances")
          .select("*")
          .in("id", accountIds)

        if (balanceError) throw balanceError

        const { data: monthlyData, error: monthlyError } = await this.supabase
          .from("monthly_transaction_summary")
          .select("*")
          .in("account_id", accountIds)
          .gte("month", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

        if (monthlyError) throw monthlyError

        return { balances, monthlyData }
      },
      2 * 60 * 1000, // 2 minute cache for dashboard
    )
  }

  // Optimized budget performance queries
  async getBudgetPerformance() {
    if (!this.supabase) await this.initialize()

    const cacheKey = "budget_performance"

    return this.cachedQuery(cacheKey, async () => {
      const { data, error } = await this.supabase
        .from("budget_performance")
        .select(
          `
          *,
          categories(name, icon, color)
        `,
        )
        .order("utilization_percentage", { ascending: false })

      if (error) throw error
      return data
    })
  }

  // Efficient search with full-text search capabilities
  async searchTransactions(query: string, filters: any = {}) {
    if (!this.supabase) await this.initialize()

    const cacheKey = `search_${query}_${JSON.stringify(filters)}`

    return this.cachedQuery(cacheKey, async () => {
      let queryBuilder = this.supabase
        .from("transactions")
        .select(
          `
          *,
          categories(name, icon, color),
          accounts(name, type)
        `,
        )
        .or(`description.ilike.%${query}%, notes.ilike.%${query}%`)
        .eq("status", "completed")

      if (filters.accountId) {
        queryBuilder = queryBuilder.eq("account_id", filters.accountId)
      }

      if (filters.categoryId) {
        queryBuilder = queryBuilder.eq("category_id", filters.categoryId)
      }

      if (filters.startDate) {
        queryBuilder = queryBuilder.gte("transaction_date", filters.startDate)
      }

      if (filters.endDate) {
        queryBuilder = queryBuilder.lte("transaction_date", filters.endDate)
      }

      const { data, error } = await queryBuilder.order("transaction_date", { ascending: false }).limit(50)

      if (error) throw error
      return data
    })
  }

  // Database maintenance functions
  async refreshMaterializedViews() {
    if (!this.supabase) await this.initialize()

    const { error } = await this.supabase.rpc("refresh_financial_views")
    if (error) throw error
  }

  async cleanExpiredCache() {
    if (!this.supabase) await this.initialize()

    const { data, error } = await this.supabase.rpc("clean_expired_cache")
    if (error) throw error
    return data
  }

  async logQueryPerformance(queryName: string, executionTime: number, parameters?: any) {
    if (!this.supabase) await this.initialize()

    await this.supabase.from("query_performance_log").insert({
      query_name: queryName,
      execution_time_ms: Math.round(executionTime),
      parameters: parameters || null,
    })
  }

  // Connection pooling and query optimization
  async getConnectionStats() {
    if (!this.supabase) await this.initialize()

    const { data, error } = await this.supabase.rpc("pg_stat_activity").select("count(*)").not("state", "eq", "idle")

    if (error) throw error
    return data
  }

  // Preload commonly accessed data
  async preloadDashboardData(accountIds: string[]) {
    const promises = [this.getDashboardSummary(accountIds), this.getBudgetPerformance(), this.getUpcomingBills(30)]

    await Promise.all(promises)
  }

  async getUpcomingBills(daysAhead = 30) {
    if (!this.supabase) await this.initialize()

    const cacheKey = `upcoming_bills_${daysAhead}`

    return this.cachedQuery(cacheKey, async () => {
      const { data, error } = await this.supabase.rpc("get_upcoming_bills", { days_ahead: daysAhead })

      if (error) throw error
      return data
    })
  }

  // Clear all caches
  clearCache() {
    this.queryCache.clear()
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now()
    const total = this.queryCache.size
    const expired = Array.from(this.queryCache.values()).filter((item) => item.expires <= now).length

    return {
      total,
      active: total - expired,
      expired,
      hitRate: total > 0 ? (((total - expired) / total) * 100).toFixed(2) : "0.00",
    }
  }

  async getPerfStats() {
    if (!this.supabase) await this.initialize()
    const { data, error } = await this.supabase.rpc("get_perf_stats")
    if (error) throw error
    return data
  }

  async getDbHints() {
    if (!this.supabase) await this.initialize()
    const { data, error } = await this.supabase.rpc("get_db_hints")
    if (error) throw error
    return data
  }
}

// Singleton instance
export const dbOptimizer = new DatabaseOptimizer()

export const getPerfStats = () => dbOptimizer.getPerfStats()
export const getDbHints = () => dbOptimizer.getDbHints()
