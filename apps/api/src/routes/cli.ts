import { Hono } from "hono"
import { eq, sql } from "drizzle-orm"
import { db } from "../db"
import { cliInstall, user } from "../db/schema"
import { success, internalError, logError } from "../utils/errors"
import type { AuthContext } from "../types"

const app = new Hono<AuthContext>()

// Track CLI install - public endpoint (no auth required)
// Called by CLI on first run to track installations
app.post("/install", async (c) => {
  try {
    const body = await c.req.json<{
      installId: string
      version?: string
      platformHash?: string
    }>()

    if (!body.installId) {
      return c.json({ error: "installId is required" }, 400)
    }

    // Get IP hash for basic deduplication
    const forwarded = c.req.header("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : c.req.header("cf-connecting-ip") || "unknown"
    const ipHash = await hashString(ip)

    // Check if this install already exists
    const existing = await db
      .select({ id: cliInstall.id })
      .from(cliInstall)
      .where(eq(cliInstall.installId, body.installId))
      .limit(1)

    if (existing.length > 0) {
      // Already tracked, just return success
      return success(c, { 
        success: true, 
        isNew: false,
        message: "Install already tracked" 
      })
    }

    // Record new install
    await db.insert(cliInstall).values({
      id: crypto.randomUUID(),
      installId: body.installId,
      version: body.version || "unknown",
      platformHash: body.platformHash || null,
      ipHash,
    })

    return success(c, { 
      success: true, 
      isNew: true,
      message: "Install tracked successfully" 
    })
  } catch (error) {
    logError("TrackCliInstall", error)
    return internalError(c, "Failed to track install")
  }
})

// Get CLI install analytics - admin only
app.get("/analytics", async (c) => {
  const session = c.get("session")

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    // Check if user is admin
    const [userData] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (userData?.role !== "admin") {
      return c.json({ error: "Forbidden - Admin access required" }, 403)
    }

    // Calculate last 7 days
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      days.push(date)
    }

    // Get installs for each day
    const dailyInstalls = await Promise.all(
      days.map(async (day) => {
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayStr = day.toISOString()
        const nextDayStr = nextDay.toISOString()

        const result = await db.execute(sql`
          SELECT COUNT(*) as count 
          FROM cli_install 
          WHERE installed_at >= ${dayStr}::timestamp
            AND installed_at < ${nextDayStr}::timestamp
        `)

        return Number(result.rows[0]?.count || 0)
      })
    )

    // Get total installs
    const totalResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM cli_install
    `)

    // Get unique installs by IP hash (rough estimate of unique users)
    const uniqueResult = await db.execute(sql`
      SELECT COUNT(DISTINCT ip_hash) as count FROM cli_install
    `)

    return success(c, {
      dailyInstalls,
      totalInstalls: Number(totalResult.rows[0]?.count || 0),
      uniqueInstalls: Number(uniqueResult.rows[0]?.count || 0),
    })
  } catch (error) {
    logError("FetchCliAnalytics", error)
    return internalError(c, "Failed to fetch analytics")
  }
})

// Simple hash function for IP addresses
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16)
}

export default app
