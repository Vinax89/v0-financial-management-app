import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { processReceiptWithAI } from "@/lib/ocr-service"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    // Validate type/size
    const allowed = ["image/jpeg","image/png","application/pdf"]
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    const MAX_BYTES = 10 * 1024 * 1024 // 10MB
    if (typeof (file as any).size === 'number' && (file as any).size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    // Convert file to base64 for AI processing and get bytes for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Process receipt with AI
    const receiptData = await processReceiptWithAI(base64, file.type)
    
    // Shape hardening
    const ReceiptData = z.object({
      merchantName: z.string().optional().default(''),
      totalAmount: z.number().nullable().optional().transform(v => v ?? null),
      date: z.string().optional(),
      items: z.array(z.any()).optional().default([]),
      rawText: z.string().optional().default(''),
      confidence: z.number().min(0).max(1).optional().default(0)
    })
    const safe = ReceiptData.parse(receiptData)

    // Upload raw file to Storage (path: userId/ISOdate_filename)
    const path = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const { error: upErr } = await supabase.storage.from('receipts').upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })
    if (upErr) {
        console.error("Storage upload error:", upErr)
        return NextResponse.json({ error: 'Failed to store file' }, { status: 500 })
    }
    const { data: signed } = await supabase.storage.from('receipts').createSignedUrl(path, 60 * 60) // 1h URL

    // Store receipt data in database
    const { data: receipt, error: dbError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_size: (file as any).size ?? null,
        mime_type: file.type,
        file_url: signed?.signedUrl || null,
        merchant_name: safe.merchantName,
        total_amount: safe.totalAmount,
        transaction_date: safe.date,
        items: safe.items,
        raw_text: safe.rawText,
        confidence_score: safe.confidence,
        processing_status: "completed",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save receipt" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      receipt,
      extractedData: receiptData,
    })
  } catch (error) {
    console.error("Receipt upload error:", error)
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid data from OCR service", details: error.issues }, { status: 500 })
    }
    return NextResponse.json(
      {
        error: "Failed to process receipt",
      },
      { status: 500 },
    )
  }
}
