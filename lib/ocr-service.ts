import { createServerClient } from "./supabase/server"
import { dataOrchestrator } from "./data-orchestrator"

type SupabaseClient = ReturnType<typeof createServerClient>

export interface ReceiptData {
  id: string
  fileName: string
  fileUrl: string
  status: "uploaded" | "processing" | "completed" | "failed"
  merchantName?: string
  transactionDate?: Date
  totalAmount?: number
  extractedData?: any
  confidence?: number
}

export interface ExtractedReceiptData {
  merchantName: string
  merchantAddress?: string
  transactionDate: Date
  transactionTime?: string
  subtotal?: number
  taxAmount?: number
  tipAmount?: number
  totalAmount: number
  paymentMethod?: string
  lineItems: LineItem[]
  suggestedCategory: string
  confidence: number
}

export interface LineItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
}

export class OCRService {
  private createSupabaseClient(): SupabaseClient {
    return createServerClient()
  }

  // Upload and process receipt
  async uploadReceipt(userId: string, file: File, fileUrl: string): Promise<string> {
    const supabase = this.createSupabaseClient()
    try {
      // Store receipt record
      const { data: receipt, error } = await supabase
        .from("receipts")
        .insert([
          {
            user_id: userId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_url: fileUrl,
            status: "uploaded",
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Queue OCR processing job
      await this.queueOCRJob(receipt.id, "ocr_extract", 5, supabase)

      return receipt.id
    } catch (error) {
      console.error("Failed to upload receipt:", error)
      throw new Error("Failed to upload receipt")
    }
  }

  // Queue OCR processing job
  async queueOCRJob(
    receiptId: string,
    jobType: "ocr_extract" | "data_parse" | "categorize",
    priority = 5,
    supabaseClient?: SupabaseClient,
  ): Promise<void> {
    const supabase = supabaseClient ?? this.createSupabaseClient()
    await supabase.from("ocr_processing_jobs").insert([
      {
        receipt_id: receiptId,
        job_type: jobType,
        priority,
        status: "pending",
      },
    ])

    // Trigger job processing (in a real app, this would be handled by a background worker)
    if (jobType === "ocr_extract") {
      setTimeout(() => this.processOCRJob(receiptId), 1000)
    }
  }

  // Process OCR job
  async processOCRJob(receiptId: string): Promise<void> {
    const supabase = this.createSupabaseClient()
    try {
      // Update receipt status
      await supabase
        .from("receipts")
        .update({
          status: "processing",
          processing_started_at: new Date().toISOString(),
        })
        .eq("id", receiptId)

      // Get receipt data
      const { data: receipt, error } = await supabase.from("receipts").select("*").eq("id", receiptId).single()

      if (error) throw error

      // Process with AI OCR
      const extractedData = await this.extractReceiptData(receipt.file_url)

      // Store extracted data
      await supabase
        .from("receipts")
        .update({
          status: "completed",
          processing_completed_at: new Date().toISOString(),
          raw_text: extractedData.rawText,
          confidence_score: extractedData.confidence,
          merchant_name: extractedData.merchantName,
          merchant_address: extractedData.merchantAddress,
          transaction_date: extractedData.transactionDate,
          transaction_time: extractedData.transactionTime,
          subtotal: extractedData.subtotal,
          tax_amount: extractedData.taxAmount,
          tip_amount: extractedData.tipAmount,
          total_amount: extractedData.totalAmount,
          payment_method: extractedData.paymentMethod,
          line_items: extractedData.lineItems,
          suggested_category: extractedData.suggestedCategory,
          category_confidence: extractedData.categoryConfidence,
        })
        .eq("id", receiptId)

      // Store line items
      if (extractedData.lineItems && extractedData.lineItems.length > 0) {
        const lineItemsData = extractedData.lineItems.map((item: any, index: number) => ({
          receipt_id: receiptId,
          line_number: index + 1,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          item_category: item.category,
          confidence_score: item.confidence || extractedData.confidence,
        }))

        await supabase.from("receipt_line_items").insert(lineItemsData)
      }

      // Create transaction from receipt
      await this.createTransactionFromReceipt(receiptId, extractedData, supabase)
    } catch (error) {
      console.error("OCR processing failed:", error)

      // Update receipt status as failed
      await supabase
        .from("receipts")
        .update({
          status: "failed",
          processing_completed_at: new Date().toISOString(),
        })
        .eq("id", receiptId)

      // Create watchdog alert
      await dataOrchestrator.createWatchdogAlert({
        alertType: "data_anomaly",
        severity: "medium",
        title: "OCR Processing Failed",
        description: `Receipt processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        sourceReference: receiptId,
      })
    }
  }

  // Extract receipt data using AI OCR
  private async extractReceiptData(imageUrl: string): Promise<any> {
    try {
      // Use OpenAI Vision API for OCR
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please analyze this receipt image and extract the following information in JSON format:
                  {
                    "merchantName": "string",
                    "merchantAddress": "string",
                    "transactionDate": "YYYY-MM-DD",
                    "transactionTime": "HH:MM",
                    "subtotal": number,
                    "taxAmount": number,
                    "tipAmount": number,
                    "totalAmount": number,
                    "paymentMethod": "string",
                    "lineItems": [
                      {
                        "name": "string",
                        "quantity": number,
                        "unitPrice": number,
                        "totalPrice": number,
                        "category": "string"
                      }
                    ],
                    "suggestedCategory": "string (Food & Dining, Shopping, Transportation, etc.)",
                    "confidence": number (0-1)
                  }
                  
                  If any field is not clearly visible, use null. Focus on accuracy over completeness.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content returned from OpenAI")
      }

      // Parse JSON response
      const extractedData = JSON.parse(content)

      // Add raw text and additional processing
      return {
        rawText: content,
        confidence: extractedData.confidence || 0.8,
        merchantName: extractedData.merchantName,
        merchantAddress: extractedData.merchantAddress,
        transactionDate: extractedData.transactionDate,
        transactionTime: extractedData.transactionTime,
        subtotal: extractedData.subtotal,
        taxAmount: extractedData.taxAmount,
        tipAmount: extractedData.tipAmount,
        totalAmount: extractedData.totalAmount,
        paymentMethod: extractedData.paymentMethod,
        lineItems: extractedData.lineItems || [],
        suggestedCategory: extractedData.suggestedCategory || "Other",
        categoryConfidence: extractedData.confidence || 0.8,
      }
    } catch (error) {
      console.error("OCR extraction failed:", error)

      // Fallback to basic text extraction
      return this.fallbackTextExtraction(imageUrl)
    }
  }

  // Fallback text extraction method
  private async fallbackTextExtraction(imageUrl: string): Promise<any> {
    // This would use a simpler OCR service like Google Vision API
    // For now, return a basic structure
    return {
      rawText: "Receipt text extraction failed",
      confidence: 0.1,
      merchantName: "Unknown Merchant",
      transactionDate: new Date().toISOString().split("T")[0],
      totalAmount: 0,
      lineItems: [],
      suggestedCategory: "Other",
      categoryConfidence: 0.1,
    }
  }

  // Create transaction from receipt data
  private async createTransactionFromReceipt(
    receiptId: string,
    extractedData: any,
    supabaseClient?: SupabaseClient,
  ): Promise<void> {
    const supabase = supabaseClient ?? this.createSupabaseClient()
    try {
      const transactionData = {
        amount: -(extractedData.totalAmount || 0), // Negative for expenses
        description: `${extractedData.merchantName || "Receipt"} - ${extractedData.transactionDate}`,
        date: extractedData.transactionDate || new Date().toISOString().split("T")[0],
        category: extractedData.suggestedCategory || "Other",
        source: "receipt_ocr",
        source_id: receiptId,
        merchant_name: extractedData.merchantName,
        metadata: {
          receipt_id: receiptId,
          ocr_confidence: extractedData.confidence,
          subtotal: extractedData.subtotal,
          tax_amount: extractedData.taxAmount,
          tip_amount: extractedData.tipAmount,
          payment_method: extractedData.paymentMethod,
          line_items: extractedData.lineItems,
        },
      }

      const { data: transaction, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single()

      if (error) throw error

      // Update receipt with transaction reference
      await supabase
        .from("receipts")
        .update({
          is_synced_to_transactions: true,
          transaction_id: transaction.id,
        })
        .eq("id", receiptId)
    } catch (error) {
      console.error("Failed to create transaction from receipt:", error)

      // Log sync error
      await supabase
        .from("receipts")
        .update({
          sync_error: error instanceof Error ? error.message : "Unknown sync error",
        })
        .eq("id", receiptId)
    }
  }

  // Get user receipts
  async getUserReceipts(userId: string, limit = 50): Promise<ReceiptData[]> {
    const supabase = this.createSupabaseClient()
    const { data, error } = await supabase
      .from("receipts")
      .select(`
        *,
        receipt_line_items (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapReceiptData) || []
  }

  // Get receipt by ID
  async getReceipt(receiptId: string, userId: string): Promise<ReceiptData | null> {
    const supabase = this.createSupabaseClient()
    const { data, error } = await supabase
      .from("receipts")
      .select(`
        *,
        receipt_line_items (*)
      `)
      .eq("id", receiptId)
      .eq("user_id", userId)
      .single()

    if (error) return null

    return this.mapReceiptData(data)
  }

  // Update receipt data (user corrections)
  async updateReceiptData(receiptId: string, userId: string, updates: Partial<ExtractedReceiptData>): Promise<void> {
    const supabase = this.createSupabaseClient()
    // Store user corrections
    const { error } = await supabase
      .from("receipts")
      .update({
        merchant_name: updates.merchantName,
        transaction_date: updates.transactionDate?.toISOString().split("T")[0],
        total_amount: updates.totalAmount,
        suggested_category: updates.suggestedCategory,
        verified_by_user: true,
        user_corrections: updates,
      })
      .eq("id", receiptId)
      .eq("user_id", userId)

    if (error) throw error

    // Update associated transaction
    await this.updateAssociatedTransaction(receiptId, updates, supabase)
  }

  // Update associated transaction
  private async updateAssociatedTransaction(
    receiptId: string,
    updates: Partial<ExtractedReceiptData>,
    supabaseClient?: SupabaseClient,
  ): Promise<void> {
    const supabase = supabaseClient ?? this.createSupabaseClient()
    const { data: receipt } = await supabase.from("receipts").select("transaction_id").eq("id", receiptId).single()

    if (!receipt?.transaction_id) return

    const transactionUpdates: any = {}

    if (updates.totalAmount !== undefined) {
      transactionUpdates.amount = -updates.totalAmount
    }

    if (updates.merchantName) {
      transactionUpdates.description = `${updates.merchantName} - ${updates.transactionDate?.toISOString().split("T")[0] || ""}`
      transactionUpdates.merchant_name = updates.merchantName
    }

    if (updates.transactionDate) {
      transactionUpdates.date = updates.transactionDate.toISOString().split("T")[0]
    }

    if (updates.suggestedCategory) {
      transactionUpdates.category = updates.suggestedCategory
    }

    if (Object.keys(transactionUpdates).length > 0) {
      await supabase.from("transactions").update(transactionUpdates).eq("id", receipt.transaction_id)
    }
  }

  // Submit feedback
  async submitFeedback(
    receiptId: string,
    userId: string,
    feedback: {
      type: "correction" | "verification" | "flag_error"
      fieldName?: string
      originalValue?: string
      correctedValue?: string
      rating?: number
      comments?: string
    },
  ): Promise<void> {
    const supabase = this.createSupabaseClient()
    await supabase.from("receipt_feedback").insert([
      {
        receipt_id: receiptId,
        user_id: userId,
        feedback_type: feedback.type,
        field_name: feedback.fieldName,
        original_value: feedback.originalValue,
        corrected_value: feedback.correctedValue,
        accuracy_rating: feedback.rating,
        comments: feedback.comments,
      },
    ])
  }

  // Get processing statistics
  async getProcessingStats(userId: string): Promise<any> {
    const supabase = this.createSupabaseClient()
    const { data: stats } = await supabase
      .from("receipts")
      .select("status, confidence_score, created_at")
      .eq("user_id", userId)

    if (!stats) return null

    const totalReceipts = stats.length
    const completedReceipts = stats.filter((s) => s.status === "completed").length
    const failedReceipts = stats.filter((s) => s.status === "failed").length
    const averageConfidence =
      stats.filter((s) => s.confidence_score).reduce((sum, s) => sum + s.confidence_score, 0) / completedReceipts || 0

    return {
      totalReceipts,
      completedReceipts,
      failedReceipts,
      successRate: totalReceipts > 0 ? (completedReceipts / totalReceipts) * 100 : 0,
      averageConfidence: averageConfidence * 100,
    }
  }

  // Helper method to map database data to ReceiptData
  private mapReceiptData(row: any): ReceiptData {
    return {
      id: row.id,
      fileName: row.file_name,
      fileUrl: row.file_url,
      status: row.status,
      merchantName: row.merchant_name,
      transactionDate: row.transaction_date ? new Date(row.transaction_date) : undefined,
      totalAmount: row.total_amount,
      extractedData: {
        merchantAddress: row.merchant_address,
        transactionTime: row.transaction_time,
        subtotal: row.subtotal,
        taxAmount: row.tax_amount,
        tipAmount: row.tip_amount,
        paymentMethod: row.payment_method,
        lineItems: row.receipt_line_items || [],
        suggestedCategory: row.suggested_category,
      },
      confidence: row.confidence_score,
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService()

export async function processReceiptWithAI(base64Image: string, mimeType: string) {
  try {
    // Use OpenAI Vision API for OCR
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this receipt image and extract the following information in JSON format:
                {
                  "merchantName": "string",
                  "merchantAddress": "string",
                  "date": "YYYY-MM-DD",
                  "time": "HH:MM",
                  "subtotal": number,
                  "tax": number,
                  "tip": number,
                  "totalAmount": number,
                  "paymentMethod": "string",
                  "items": [
                    {
                      "name": "string",
                      "quantity": number,
                      "price": number
                    }
                  ],
                  "category": "string (Food & Dining, Shopping, Transportation, etc.)",
                  "confidence": number (0-1),
                  "rawText": "string"
                }
                
                If any field is not clearly visible, use null. Focus on accuracy over completeness.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    // Parse JSON response
    const extractedData = JSON.parse(content)

    return {
      merchantName: extractedData.merchantName || "Unknown Merchant",
      merchantAddress: extractedData.merchantAddress,
      date: extractedData.date || new Date().toISOString().split("T")[0],
      time: extractedData.time,
      subtotal: extractedData.subtotal,
      tax: extractedData.tax,
      tip: extractedData.tip,
      totalAmount: extractedData.totalAmount || 0,
      paymentMethod: extractedData.paymentMethod,
      items: extractedData.items || [],
      category: extractedData.category || "Other",
      confidence: extractedData.confidence || 0.8,
      rawText: content,
    }
  } catch (error) {
    console.error("OCR extraction failed:", error)

    // Return fallback data
    return {
      merchantName: "Unknown Merchant",
      date: new Date().toISOString().split("T")[0],
      totalAmount: 0,
      items: [],
      category: "Other",
      confidence: 0.1,
      rawText: "Receipt processing failed",
    }
  }
}
