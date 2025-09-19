export interface LoginAttempt {
  email: string
  timestamp: number
  success: boolean
  ip?: string
}

export class AuthSecurity {
  private static attempts: Map<string, LoginAttempt[]> = new Map()
  private static readonly MAX_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  static recordAttempt(email: string, success: boolean, ip?: string): boolean {
    const key = email.toLowerCase()
    const now = Date.now()

    if (!this.attempts.has(key)) {
      this.attempts.set(key, [])
    }

    const userAttempts = this.attempts.get(key)!

    // Clean old attempts (older than lockout duration)
    const validAttempts = userAttempts.filter((attempt) => now - attempt.timestamp < this.LOCKOUT_DURATION)

    // Add current attempt
    validAttempts.push({ email: key, timestamp: now, success, ip })
    this.attempts.set(key, validAttempts)

    // Check if account should be locked
    const failedAttempts = validAttempts.filter((attempt) => !attempt.success)
    return failedAttempts.length < this.MAX_ATTEMPTS
  }

  static isAccountLocked(email: string): boolean {
    const key = email.toLowerCase()
    const userAttempts = this.attempts.get(key) || []
    const now = Date.now()

    const recentFailedAttempts = userAttempts.filter(
      (attempt) => !attempt.success && now - attempt.timestamp < this.LOCKOUT_DURATION,
    )

    return recentFailedAttempts.length >= this.MAX_ATTEMPTS
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters long" }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }
    }

    return { valid: true }
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }
}
