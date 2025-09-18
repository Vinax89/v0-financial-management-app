import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const accounts = await plaidService.getConnectedAccounts(userId)

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Get accounts error:", error)
    return NextResponse.json({ error: "Failed to get accounts" }, { status: 500 })
  }
}
