import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { parseJson, json, HttpError } from "@/lib/http"
import { ExchangePublicTokenSchema } from "@/lib/validation/plaid"

export async function POST(request: NextRequest) {
   try {
    const { publicToken } = await parseJson(request, ExchangePublicTokenSchema)
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return json({ error: "Unauthorized" }, { status: 401 })
    const itemId = await plaidService.exchangePublicToken(publicToken, user.id)
    return json({ itemId })
   } catch (error: any) {
    if (error instanceof HttpError) return json({ error: error.message }, { status: error.status })
    return json({ error: "Failed to exchange token" }, { status: 500 })
   }
}
