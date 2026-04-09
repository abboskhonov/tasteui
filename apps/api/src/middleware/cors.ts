import type { Context, Next } from "hono"
import { cors } from "hono/cors"

// Parse allowed origins from environment or use defaults
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGINS
  
  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim())
  }
  
  // Default development origins
  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ]
  
  // Add production origin if set
  const frontendUrl = process.env.FRONTEND_URL
  if (frontendUrl) {
    defaultOrigins.push(frontendUrl)
  }
  
  return defaultOrigins
}

// CORS configuration for API
export const corsConfig = cors({
  origin: getAllowedOrigins(),
  allowHeaders: ["Content-Type", "Authorization", "Accept", "X-CSRF-Token"],
  allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
  exposeHeaders: ["Content-Length", "Set-Cookie"],
  maxAge: 600,
  credentials: true,
})

// Cache middleware for public GET requests
export async function cacheMiddleware(
  c: Context,
  next: Next,
  maxAge = 60,
  staleWhileRevalidate = 300
): Promise<void> {
  await next()
  if (c.req.method === "GET") {
    c.header("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`)
  }
}

// Apply cache to specific routes
export function createCacheMiddleware(maxAge = 60) {
  return async (c: Context, next: Next): Promise<void> => {
    await cacheMiddleware(c, next, maxAge)
  }
}
