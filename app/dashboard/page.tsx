import DashboardClient from "./client"
import { getPerfStats } from "@/lib/database-optimizer.server"

export default async function DashboardPage() {
  const stats = await getPerfStats()
  return <DashboardClient stats={{ cached: stats.cached, hints: stats.hints }} />
}
