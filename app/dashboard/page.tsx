import DashboardClient from "./client"
import { getPerfStats } from "@/lib/database-optimizer"

export default async function DashboardPage() {
  const stats = await getPerfStats()
  return <DashboardClient stats={{ cached: stats.cached, hints: stats.hints }} />
}
