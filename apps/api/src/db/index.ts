import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import * as schema from "./schema"

// Enable WebSocket support for Neon (only needed for local Bun dev)
if (process.env.NODE_ENV !== "production") {
  neonConfig.webSocketConstructor = ws
}

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create connection pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool tuning for serverless environment
  max: 20,                    // Max connections in pool (increased for better concurrency)
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout for new connections (10s)
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

// Handle pool errors to prevent crashes
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err)
})

// Test connection on startup
pool.connect().then((client) => {
  console.log("✅ Database connected successfully")
  client.release()
}).catch((err) => {
  console.error("❌ Database connection failed:", err.message)
})

export const db = drizzle(pool, { schema })
export * from "./schema"
