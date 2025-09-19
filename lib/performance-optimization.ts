"use client"

import type React from "react"

import { useState } from "react"

import { useCallback, useMemo, useRef, useEffect } from "react"

export interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  memoryUsage?: number
}

export class PerformanceTracker {
  private static metrics = new Map<string, PerformanceMetrics>()

  static trackRender(componentName: string, startTime: number) {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
    }

    const newCount = existing.renderCount + 1
    const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount

    this.metrics.set(componentName, {
      renderCount: newCount,
      lastRenderTime: renderTime,
      averageRenderTime: newAverage,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
    })
  }

  static getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName)
  }

  static getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  static clearMetrics() {
    this.metrics.clear()
  }
}

export function usePerformanceTracker(componentName: string) {
  const startTimeRef = useRef<number>()

  useEffect(() => {
    startTimeRef.current = performance.now()

    return () => {
      if (startTimeRef.current) {
        PerformanceTracker.trackRender(componentName, startTimeRef.current)
      }
    }
  })
}

export function useThrottledCallback<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        return callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now()
            callback(...args)
          },
          delay - (now - lastCallRef.current),
        )
      }
    },
    [callback, delay],
  ) as T
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useMemoizedArray<T>(array: T[], deps: React.DependencyList): T[] {
  return useMemo(() => array, deps)
}

export function useMemoizedObject<T extends Record<string, any>>(object: T, deps: React.DependencyList): T {
  return useMemo(() => object, deps)
}

export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args)
  }, []) as T
}

export function useBatchedUpdates() {
  const updatesRef = useRef<(() => void)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current.splice(0)
      updates.forEach((update) => update())
    }, 0)
  }, [])

  return batchUpdate
}
