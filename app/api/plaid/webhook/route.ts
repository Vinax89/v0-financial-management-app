import { type NextRequest, NextResponse } from "next/server"
import { plaidService } from "@/lib/plaid-service"
import { verifyPlaidWebhook } from "@/lib/plaid-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Verify webhook (implement proper verification in production)
    if (!verifyPlaidWebhook(body, headers)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { webhook_type, webhook_code } = payload

    await plaidService.handleWebhook(webhook_type, webhook_code, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
