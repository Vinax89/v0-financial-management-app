import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { processReceiptWithAI } from "@/lib/ocr-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()

    // Get user from session - RLS will automatically filter by user_id
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

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed." },
        { status: 400 },
      )
    }

    // Convert file to base64 for AI processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Process receipt with AI
    const receiptData = await processReceiptWithAI(base64, file.type)

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

    if (receiptData.totalAmount && receiptData.merchantName && receiptData.totalAmount > 0) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: -Math.abs(receiptData.totalAmount), // Negative for expense
        description: `Receipt from ${receiptData.merchantName}`,
        transaction_type: "expense",
        payment_method: "card",
        merchant: receiptData.merchantName,
        transaction_date: receiptData.date || new Date().toISOString().split("T")[0],
        notes: `Auto-generated from receipt upload (${file.name})`,
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
