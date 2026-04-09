import { rateLimiter } from "hono-rate-limiter"
import type { Context } from "hono"

// Check if we're in development mode
const isDev = process.env.NODE_ENV === "development" || process.env.RATE_LIMIT_DISABLED === "true"

// In-memory store for rate limiting (use Redis in production for distributed systems)
// This stores IP-based rate limits
const ipStore = new Map<string, { count: number; resetTime: number }>()

// Get client IP from various headers
function getClientIP(c: Context): string {
  // Try various headers that might contain the real client IP
  const forwarded = c.req.header("x-forwarded-for")
  const realIP = c.req.header("x-real-ip")
  const cfConnectingIP = c.req.header("cf-connecting-ip")
  
  return cfConnectingIP || realIP || forwarded?.split(",")[0]?.trim() || "unknown"
}

// Create a rate limiter with custom options
export function createRateLimiter(options: {
  windowMs?: number
  max?: number
  message?: string
  skipSuccessfulRequests?: boolean
}) {
  const windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutes default
  const max = options.max || 100 // 100 requests per window
  const message = options.message || "Too many requests, please try again later."

  return rateLimiter({
    windowMs,
    limit: max,
    standardHeaders: true,
    keyGenerator: (c) => getClientIP(c),
    handler: (c) => {
      return c.json(
        {
          error: "Rate limit exceeded",
          message,
          retryAfter: Math.ceil(windowMs / 1000),
        },
        429
      )
    },
  })
}

// No-op rate limiter for development
function createNoOpRateLimiter() {
  return async (c: Context, next: () => Promise<void>) => {
    await next()
  }
}

// Pre-configured rate limiters for different use cases
// NOTE: In development, these are bypassed via RATE_LIMIT_DISABLED env var
export const strictRateLimiter = isDev 
  ? createNoOpRateLimiter() as unknown as ReturnType<typeof createRateLimiter>
  : createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 requests per 15 minutes
      message: "Too many attempts. Please try again later.",
    })

export const standardRateLimiter = isDev
  ? createNoOpRateLimiter() as unknown as ReturnType<typeof createRateLimiter>
  : createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes  
      max: 1000, // 1000 requests per 15 minutes (67/min)
      message: "Rate limit exceeded. Please slow down your requests.",
    })

export const generousRateLimiter = isDev
  ? createNoOpRateLimiter() as unknown as ReturnType<typeof createRateLimiter>
  : createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute
      message: "Too many requests. Please slow down.",
    })

// Auth-specific rate limiter (stricter for login/signup)
export const authRateLimiter = isDev
  ? createNoOpRateLimiter() as unknown as ReturnType<typeof createRateLimiter>
  : createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // 30 attempts per 15 minutes
      message: "Too many authentication attempts. Please try again later.",
    })

// CLI tracking rate limiter (prevent spam)
export const cliRateLimiter = isDev
  ? createNoOpRateLimiter() as unknown as ReturnType<typeof createRateLimiter>
  : createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 120, // 120 CLI calls per minute per IP
      message: "Too many CLI tracking requests.",
    })
