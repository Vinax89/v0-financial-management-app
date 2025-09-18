"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Client-side lazy loading components with ssr: false
export const TaxBreakdownChart = dynamic(
  () => import("@/components/tax-breakdown-chart").then((mod) => ({ default: mod.TaxBreakdownChart })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  },
)

export const SpendingBreakdownChart = dynamic(
  () => import("@/components/spending-breakdown-chart").then((mod) => ({ default: mod.SpendingBreakdownChart })),
  {
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false,
  },
)

export const CostOfLivingComparison = dynamic(
  () => import("@/components/cost-of-living-comparison").then((mod) => ({ default: mod.CostOfLivingComparison })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  },
)

// Client-side lazy loading for heavy calculation utilities
export const useTaxCalculator = dynamic(
  () => import("@/lib/tax-calculator").then((mod) => ({ default: mod.calculateTaxes })),
  { ssr: false },
)
