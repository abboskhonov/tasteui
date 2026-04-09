import { rateLimiter } from "hono-rate-limiter"
import type { Context } from "hono"

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
    legacyHeaders: false,
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

// Pre-configured rate limiters for different use cases
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: "Too many attempts. Please try again in 15 minutes.",
})

export const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Rate limit exceeded. Please slow down your requests.",
})

export const generousRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many requests. Please slow down.",
})

// Auth-specific rate limiter (stricter for login/signup)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: "Too many authentication attempts. Please try again later.",
})

// CLI tracking rate limiter (prevent spam)
export const cliRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 CLI calls per minute per IP
  message: "Too many CLI tracking requests.",
})
