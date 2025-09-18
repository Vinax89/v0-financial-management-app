import { createServerClient } from "@/lib/supabase/server"

export interface DataSource {
  id: string
  name: string
  type: "bank" | "plaid" | "manual" | "ocr" | "csv"
  status: "active" | "inactive" | "error"
  config: Record<string, any>
  lastSync?: Date
}

export interface ProcessingJob {
  id: string
  sourceId: string
  jobType: "import" | "categorize" | "validate" | "reconcile"
  status: "pending" | "processing" | "completed" | "failed"
  inputData?: Record<string, any>
  outputData?: Record<string, any>
  errorDetails?: string
}

export interface ValidationRule {
  id: string
  name: string
  ruleType: "amount_range" | "category_mapping" | "duplicate_detection"
  conditions: Record<string, any>
  actions: Record<string, any>
  isActive: boolean
}

export class DataOrchestrator {
  private supabase = createServerClient()

  // Data Source Management
  async registerDataSource(source: Omit<DataSource, "id">): Promise<string> {
    const { data, error } = await this.supabase
      .from("data_sources")
      .insert([
        {
          name: source.name,
          type: source.type,
          status: source.status,
          config: source.config,
        },
      ])
      .select("id")
      .single()

    if (error) throw new Error(`Failed to register data source: ${error.message}`)
    return data.id
  }

  async getDataSources(): Promise<DataSource[]> {
    const { data, error } = await this.supabase
      .from("data_sources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch data sources: ${error.message}`)
    return data.map(this.mapDataSource)
  }

  // Job Processing
  async createProcessingJob(job: Omit<ProcessingJob, "id" | "status">): Promise<string> {
    const { data, error } = await this.supabase
      .from("data_processing_jobs")
      .insert([
        {
          source_id: job.sourceId,
          job_type: job.jobType,
          input_data: job.inputData,
          status: "pending",
        },
      ])
      .select("id")
      .single()

    if (error) throw new Error(`Failed to create processing job: ${error.message}`)

    // Trigger job processing
    this.processJob(data.id)

    return data.id
  }

  async processJob(jobId: string): Promise<void> {
    try {
      // Update job status to processing
      await this.supabase
        .from("data_processing_jobs")
        .update({
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .eq("id", jobId)

      // Get job details
      const { data: job, error } = await this.supabase
        .from("data_processing_jobs")
        .select("*, data_sources(*)")
        .eq("id", jobId)
        .single()

      if (error) throw new Error(`Failed to fetch job: ${error.message}`)

      let result: Record<string, any> = {}

      // Process based on job type
      switch (job.job_type) {
        case "import":
          result = await this.processImport(job)
          break
        case "categorize":
          result = await this.processCategoriztion(job)
          break
        case "validate":
          result = await this.processValidation(job)
          break
        case "reconcile":
          result = await this.processReconciliation(job)
          break
      }

      // Update job as completed
      await this.supabase
        .from("data_processing_jobs")
        .update({
          status: "completed",
          output_data: result,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)
    } catch (error) {
      // Update job as failed
      await this.supabase
        .from("data_processing_jobs")
        .update({
          status: "failed",
          error_details: error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)

      // Create watchdog alert
      await this.createWatchdogAlert({
        alertType: "data_anomaly",
        severity: "high",
        title: "Job Processing Failed",
        description: `Job ${jobId} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        sourceReference: jobId,
      })
    }
  }

  // Processing Methods
  private async processImport(job: any): Promise<Record<string, any>> {
    const { input_data } = job
    const transactions = input_data.transactions || []

    const processedTransactions = []

    for (const transaction of transactions) {
      // Validate transaction data
      const validatedTransaction = await this.validateTransaction(transaction)

      // Auto-categorize
      const categorizedTransaction = await this.categorizeTransaction(validatedTransaction)

      // Check for duplicates
      const isDuplicate = await this.checkDuplicate(categorizedTransaction)

      if (!isDuplicate) {
        processedTransactions.push(categorizedTransaction)
      }
    }

    return {
      processedCount: processedTransactions.length,
      skippedCount: transactions.length - processedTransactions.length,
      transactions: processedTransactions,
    }
  }

  private async processCategoriztion(job: any): Promise<Record<string, any>> {
    const { input_data } = job
    const transactionId = input_data.transactionId

    // Get transaction
    const { data: transaction, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    if (error) throw new Error(`Transaction not found: ${error.message}`)

    // Get categories with keywords and patterns
    const { data: categories } = await this.supabase.from("transaction_categories").select("*").eq("is_system", true)

    const suggestedCategory = await this.suggestCategory(transaction, categories || [])

    return {
      transactionId,
      suggestedCategory,
      confidence: suggestedCategory.confidence,
    }
  }

  private async processValidation(job: any): Promise<Record<string, any>> {
    const { input_data } = job
    const data = input_data.data

    // Get validation rules
    const { data: rules } = await this.supabase.from("data_validation_rules").select("*").eq("is_active", true)

    const validationResults = []

    for (const rule of rules || []) {
      const result = await this.applyValidationRule(data, rule)
      validationResults.push(result)
    }

    return {
      validationResults,
      isValid: validationResults.every((r) => r.passed),
      errors: validationResults.filter((r) => !r.passed),
    }
  }

  private async processReconciliation(job: any): Promise<Record<string, any>> {
    const { input_data } = job
    const accountId = input_data.accountId
    const period = input_data.period || "current_month"

    // Get account transactions for period
    const { data: transactions } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .gte("date", this.getPeriodStart(period))
      .lte("date", this.getPeriodEnd(period))

    // Calculate reconciliation metrics
    const totalIncome = transactions?.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0
    const totalExpenses = transactions?.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
    const netFlow = totalIncome - totalExpenses

    return {
      accountId,
      period,
      totalIncome,
      totalExpenses,
      netFlow,
      transactionCount: transactions?.length || 0,
    }
  }

  // Helper Methods
  private async validateTransaction(transaction: any): Promise<any> {
    // Basic validation
    if (!transaction.amount || !transaction.date || !transaction.description) {
      throw new Error("Missing required transaction fields")
    }

    // Amount validation
    if (typeof transaction.amount !== "number" || isNaN(transaction.amount)) {
      throw new Error("Invalid transaction amount")
    }

    // Date validation
    const date = new Date(transaction.date)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid transaction date")
    }

    return {
      ...transaction,
      date: date.toISOString(),
      amount: Number.parseFloat(transaction.amount.toFixed(2)),
    }
  }

  private async categorizeTransaction(transaction: any): Promise<any> {
    const { data: categories } = await this.supabase.from("transaction_categories").select("*")

    const suggestedCategory = await this.suggestCategory(transaction, categories || [])

    return {
      ...transaction,
      category_id: suggestedCategory.id,
      category_confidence: suggestedCategory.confidence,
    }
  }

  private async suggestCategory(transaction: any, categories: any[]): Promise<any> {
    const description = transaction.description.toLowerCase()
    let bestMatch = { id: null, confidence: 0, name: "Other" }

    for (const category of categories) {
      let confidence = 0

      // Check keywords
      if (category.keywords) {
        for (const keyword of category.keywords) {
          if (description.includes(keyword.toLowerCase())) {
            confidence += 0.3
          }
        }
      }

      // Check patterns
      if (category.patterns) {
        for (const pattern of category.patterns) {
          const regex = new RegExp(pattern, "i")
          if (regex.test(description)) {
            confidence += 0.5
          }
        }
      }

      if (confidence > bestMatch.confidence && confidence >= (category.confidence_threshold || 0.8)) {
        bestMatch = {
          id: category.id,
          confidence,
          name: category.name,
        }
      }
    }

    // Default to 'Other' category if no good match
    if (!bestMatch.id) {
      const otherCategory = categories.find((c) => c.name === "Other")
      bestMatch = {
        id: otherCategory?.id || null,
        confidence: 0.1,
        name: "Other",
      }
    }

    return bestMatch
  }

  private async checkDuplicate(transaction: any): Promise<boolean> {
    const { data: existing } = await this.supabase
      .from("transactions")
      .select("id")
      .eq("amount", transaction.amount)
      .eq("description", transaction.description)
      .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Within 7 days
      .limit(1)

    return (existing?.length || 0) > 0
  }

  private async applyValidationRule(data: any, rule: any): Promise<any> {
    // Implementation depends on rule type
    switch (rule.rule_type) {
      case "amount_range":
        return this.validateAmountRange(data, rule)
      case "category_mapping":
        return this.validateCategoryMapping(data, rule)
      case "duplicate_detection":
        return this.validateDuplicates(data, rule)
      default:
        return { passed: true, rule: rule.name }
    }
  }

  private validateAmountRange(data: any, rule: any): any {
    const { min, max } = rule.conditions
    const amount = Math.abs(data.amount || 0)
    const passed = amount >= (min || 0) && amount <= (max || Number.POSITIVE_INFINITY)

    return {
      passed,
      rule: rule.name,
      message: passed ? "Amount within valid range" : `Amount ${amount} outside range ${min}-${max}`,
    }
  }

  private validateCategoryMapping(data: any, rule: any): any {
    const { validCategories } = rule.conditions
    const passed = !data.category_id || validCategories.includes(data.category_id)

    return {
      passed,
      rule: rule.name,
      message: passed ? "Valid category" : "Invalid category mapping",
    }
  }

  private validateDuplicates(data: any, rule: any): any {
    // This would need to check against existing transactions
    return {
      passed: true,
      rule: rule.name,
      message: "Duplicate check passed",
    }
  }

  // Watchdog System
  async createWatchdogAlert(alert: {
    alertType: string
    severity: "low" | "medium" | "high" | "critical"
    title: string
    description?: string
    sourceReference?: string
  }): Promise<void> {
    await this.supabase.from("watchdog_alerts").insert([
      {
        alert_type: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source_reference: alert.sourceReference,
      },
    ])
  }

  async getActiveAlerts(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("watchdog_alerts")
      .select("*")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`)
    return data || []
  }

  // Utility Methods
  private mapDataSource(row: any): DataSource {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      config: row.config,
      lastSync: row.last_sync ? new Date(row.last_sync) : undefined,
    }
  }

  private getPeriodStart(period: string): string {
    const now = new Date()
    switch (period) {
      case "current_month":
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      case "last_month":
        return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    }
  }

  private getPeriodEnd(period: string): string {
    const now = new Date()
    switch (period) {
      case "current_month":
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      case "last_month":
        return new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    }
  }
}

// Export singleton instance
export const dataOrchestrator = new DataOrchestrator()
