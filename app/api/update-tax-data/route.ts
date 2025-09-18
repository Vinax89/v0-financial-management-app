import { type NextRequest, NextResponse } from "next/server"
import { TaxDataUpdater } from "@/lib/tax-data-updater"

export async function POST(request: NextRequest) {
  try {
    const { year } = await request.json()
    const updater = new TaxDataUpdater()

    const result = await updater.updateTaxDatabase(year || new Date().getFullYear())

    return NextResponse.json(result)
  } catch (error) {
    console.error("Tax data update failed:", error)
    return NextResponse.json({ success: false, message: "Failed to update tax data" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const updater = new TaxDataUpdater()
    const lastUpdate = await updater.getLastUpdateTime()

    return NextResponse.json({
      lastUpdated: lastUpdate,
      currentYear: new Date().getFullYear(),
    })
  } catch (error) {
    console.error("Error fetching tax data status:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch tax data status" }, { status: 500 })
  }
}
