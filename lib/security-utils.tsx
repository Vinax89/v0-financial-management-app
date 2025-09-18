import { z } from "zod"

// Input validation schemas
export const secureInputSchemas = {
  hourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid hourly rate format")
    .refine((val) => {
      const num = Number.parseFloat(val)
      return num >= 0 && num <= 1000
    }, "Hourly rate must be between $0 and $1000"),

  hoursPerWeek: z
    .string()
    .regex(/^\d+$/, "Hours must be a whole number")
    .refine((val) => {
      const num = Number.parseInt(val)
      return num >= 1 && num <= 168
    }, "Hours per week must be between 1 and 168"),

  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
    .min(5, "ZIP code must be at least 5 digits")
    .max(10, "ZIP code cannot exceed 10 characters"),

  filingStatus: z.enum(["single", "married-joint", "married-separate", "head-of-household"]),

  dependents: z
    .string()
    .regex(/^\d+$/, "Dependents must be a number")
    .refine((val) => {
      const num = Number.parseInt(val)
      return num >= 0 && num <= 20
    }, "Dependents must be between 0 and 20"),
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 100) // Limit length
}

// Rate limiting for API calls
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
}

export const rateLimiter = new RateLimiter()

// Content Security Policy headers
export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://cdn.plaid.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.plaid.com",
    "frame-src 'self' https://cdn.plaid.com https://*.plaid.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}


// Secure session management
export function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }
  // Fallback for server-side
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Audit logging
export class SecurityAudit {
  private static logs: Array<{
    timestamp: string
    event: string
    details: any
    severity: "low" | "medium" | "high"
  }> = []

  static log(event: string, details: any, severity: "low" | "medium" | "high" = "low") {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: typeof details === "object" ? JSON.stringify(details) : details,
      severity,
    }

    this.logs.push(logEntry)

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Security Audit] ${severity.toUpperCase()}: ${event}`, details)
    }
  }

  static getLogs() {
    return this.logs
  }

  static getHighSeverityLogs() {
    return this.logs.filter((log) => log.severity === "high")
  }
}

// Input validation middleware
export function validateCalculatorInput(input: any) {
  try {
    const validated = {
      hourlyRate: secureInputSchemas.hourlyRate.parse(sanitizeInput(input.hourlyRate)),
      hoursPerWeek: secureInputSchemas.hoursPerWeek.parse(sanitizeInput(input.hoursPerWeek)),
      zipCode: secureInputSchemas.zipCode.parse(sanitizeInput(input.zipCode)),
      filingStatus: secureInputSchemas.filingStatus.parse(input.filingStatus),
      dependents: secureInputSchemas.dependents.parse(sanitizeInput(input.dependents)),
    }

    SecurityAudit.log("Input validation successful", validated, "low")
    return { success: true, data: validated }
  } catch (error) {
    SecurityAudit.log("Input validation failed", { input, error: error.message }, "medium")
    return { success: false, error: error.message }
  }
}

// Prevent XSS attacks
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Secure local storage
export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple encryption for demo - in production use proper encryption
    return btoa(data)
  }

  private static decrypt(data: string): string {
    try {
      return atob(data)
    } catch {
      return ""
    }
  }

  static setItem(key: string, value: any): void {
    try {
      const encrypted = this.encrypt(JSON.stringify(value))
      localStorage.setItem(key, encrypted)
      SecurityAudit.log("Secure storage write", { key }, "low")
    } catch (error) {
      SecurityAudit.log("Secure storage write failed", { key, error: error.message }, "medium")
    }
  }

  static getItem(key: string): any {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      const decrypted = this.decrypt(encrypted)
      SecurityAudit.log("Secure storage read", { key }, "low")
      return JSON.parse(decrypted)
    } catch (error) {
      SecurityAudit.log("Secure storage read failed", { key, error: error.message }, "medium")
      return null
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key)
    SecurityAudit.log("Secure storage delete", { key }, "low")
  }
}
