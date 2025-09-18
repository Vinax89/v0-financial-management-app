import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { processReceiptWithAI } from "@/lib/ocr-service"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 for AI processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Process receipt with AI
    const receiptData = await processReceiptWithAI(base64, file.type)

    // Store receipt data in database
    const { data: receipt, error: dbError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        merchant_name: receiptData.merchantName,
        total_amount: receiptData.totalAmount,
        transaction_date: receiptData.date,
        items: receiptData.items,
        raw_text: receiptData.rawText,
        confidence_score: receiptData.confidence,
        processing_status: "completed",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save receipt" }, { status: 500 })
    }

    // Create transaction from receipt data
    if (receiptData.totalAmount && receiptData.merchantName) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: -Math.abs(receiptData.totalAmount), // Negative for expense
        description: `Receipt from ${receiptData.merchantName}`,
        category: receiptData.category || "Other",
        date: receiptData.date || new Date().toISOString(),
        receipt_id: receipt.id,
        type: "expense",
      })
    }

    return NextResponse.json({
      success: true,
      receipt,
      extractedData: receiptData,
    })
  } catch (error) {
    console.error("Receipt upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to process receipt",
      },
      { status: 500 },
    )
  }
}
