// app/api/plaid/create-link-token/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { plaidService } from "@/lib/plaid-service"

export async function POST() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const linkToken = await plaidService.createLinkToken(user.id)
  return NextResponse.json({ linkToken })
}
