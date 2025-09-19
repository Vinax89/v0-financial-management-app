import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RatelimitResponse = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const redis = Redis.fromEnv()

// By extending Ratelimit, we can add new methods.
class RateLimiter extends Ratelimit {
  readonly #tokens: number
  constructor(tokens: number, config: Omit<RatelimitConfig, 'limiter'> & { window: string }) {
    super({
      ...config,
      limiter: Ratelimit.slidingWindow(tokens, config.window as any),
    })
    this.#tokens = tokens
  }
  async peek(identifier: string): Promise<RatelimitResponse> {
    const remaining = await this.getRemaining(identifier)
    const reset = await this.getReset(identifier)
    return { success: remaining > 0, limit: this.#tokens, remaining, reset }
  }
}

export const apiLimiter = new RateLimiter(100, {
  redis,
  window: '10 m',
  analytics: true,
  prefix: 'rl:api',
})

export const authLimiter = new RateLimiter(30, {
  redis,
  window: '10 m',
  analytics: true,
  prefix: 'rl:auth',
})
