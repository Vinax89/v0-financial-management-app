import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"

export async function POST(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json()

    if (!itemId || !userId) {
      return NextResponse.json({ error: "Item ID and user ID are required" }, { status: 400 })
    }

    await plaidService.removeItem(itemId, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove item error:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
