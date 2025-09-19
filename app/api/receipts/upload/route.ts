import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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

    // Get bytes for storage
    const bytes = await file.arrayBuffer()

    // Do NOT OCR inline. Insert row and enqueue a job.
    
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
        file_path: path,
        processing_status: "uploaded",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }
    
    const { error: jobErr } = await supabase
      .from('receipt_ocr_jobs')
      .insert({ receipt_id: receipt.id, user_id: user.id, status: 'queued' })
      
    if (jobErr) {
      console.error("Job creation error:", jobErr)
      return NextResponse.json({ error: jobErr.message }, { status: 500 })
    }
    
    return NextResponse.json({ receipt, queued: true })

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
