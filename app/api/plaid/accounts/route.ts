// app/api/plaid/accounts/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { plaidService } from "@/lib/plaid-service"

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const accounts = await plaidService.getConnectedAccounts(user.id)
  return NextResponse.json({ accounts })
}
