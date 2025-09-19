import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const linkToken = await plaidService.createLinkToken(userId)

    return NextResponse.json({ linkToken })
  } catch (error) {
    console.error("Create link token error:", error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
