import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"

export async function POST(request: NextRequest) {
  try {
    const { publicToken, userId } = await request.json()

    if (!publicToken || !userId) {
      return NextResponse.json({ error: "Public token and user ID are required" }, { status: 400 })
    }

    const itemId = await plaidService.exchangePublicToken(publicToken, userId)

    return NextResponse.json({ itemId })
  } catch (error) {
    console.error("Exchange token error:", error)
    return NextResponse.json({ error: "Failed to connect bank account" }, { status: 500 })
  }
}
