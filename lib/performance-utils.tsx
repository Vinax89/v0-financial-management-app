"use client"

import type React from "react"

import { useCallback, useMemo, useRef } from "react"

// Debounce hook for expensive calculations
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay],
  )
}

// Memoized calculation hook
export function useMemoizedCalculation<T>(calculation: () => T, dependencies: React.DependencyList): T {
  return useMemo(calculation, dependencies)
}

// Performance monitoring
export function measurePerformance<T>(name: string, fn: () => T): T {
  if (typeof window !== "undefined" && "performance" in window) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }
  return fn()
}

// Virtual scrolling for large lists
export function useVirtualScroll(items: any[], itemHeight: number, containerHeight: number) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const buffer = Math.floor(visibleCount / 2)

    return {
      visibleCount: visibleCount + buffer * 2,
      startIndex: 0,
      endIndex: Math.min(items.length, visibleCount + buffer * 2),
    }
  }, [items.length, itemHeight, containerHeight])
}

// Image optimization helper
export function getOptimizedImageProps(src: string, width: number, height: number, quality = 75) {
  return {
    src,
    width,
    height,
    quality,
    loading: "lazy" as const,
    placeholder: "blur" as const,
    blurDataURL: `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`,
    ).toString("base64")}`,
  }
}
