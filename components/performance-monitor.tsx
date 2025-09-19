"use client"

type Stats = { cached: number; hints: number }

export default function PerformanceMonitor({ stats }: { stats: Stats }) {
  return (
    <div className="text-sm opacity-80">
      <div>Queries cached: {stats.cached}</div>
      <div>Hints used: {stats.hints}</div>
    </div>
  )
}

export { default as PerformanceMonitor } from "./performance-monitor"
