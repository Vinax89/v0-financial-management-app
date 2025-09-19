"use client"

import type React from "react"
import { useCallback, useMemo, useRef, useState, useEffect } from "react"

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay],
  )
}

// Memoized calculation hook
export function useMemoizedCalculation<T>(calculation: () => T, dependencies: React.DependencyList): T {
  return useMemo(calculation, dependencies)
}

export function measurePerformance<T>(name: string, fn: () => T): T {
  if (typeof window !== "undefined" && "performance" in window) {
    const start = performance.now()
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0

    const result = fn()

    const end = performance.now()
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0
    const memoryDiff = memoryAfter - memoryBefore

    console.log(
      `[Performance] ${name}: ${(end - start).toFixed(2)}ms${memoryDiff ? `, Memory: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB` : ""}`,
    )
    return result
  }
  return fn()
}

export function useVirtualScroll(items: any[], itemHeight: number, containerHeight: number, overscan = 5) {
  const [scrollTop, setScrollTop] = useState(0)

  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2)

    return {
      visibleCount,
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
      setScrollTop,
    }
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan])
}

export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecuted = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecuted.current

    if (timeSinceLastExecution >= delay) {
      setThrottledValue(value)
      lastExecuted.current = now
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value)
        lastExecuted.current = Date.now()
      }, delay - timeSinceLastExecution)

      return () => clearTimeout(timeoutId)
    }
  }, [value, delay])

  return throttledValue
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

export function useBatchedUpdates<T>(initialValue: T, batchDelay = 100) {
  const [value, setValue] = useState(initialValue)
  const pendingUpdates = useRef<((prev: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchedSetValue = useCallback(
    (updater: (prev: T) => T) => {
      pendingUpdates.current.push(updater)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setValue((prev) => {
          let result = prev
          pendingUpdates.current.forEach((update) => {
            result = update(result)
          })
          pendingUpdates.current = []
          return result
        })
      }, batchDelay)
    },
    [batchDelay],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [value, batchedSetValue] as const
}
