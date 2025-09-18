import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { publicToken } = await request.json()
    if (!publicToken) return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const itemId = await plaidService.exchangePublicToken(publicToken, user.id)
    return NextResponse.json({ itemId })
  } catch (error) {
    console.error("Exchange token error:", error)
    return NextResponse.json({ error: "Failed to connect bank account" }, { status: 500 })
  }
}
