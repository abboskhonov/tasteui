import { Hono } from "hono"
import { eq } from "drizzle-orm"
import { auth } from "../auth"
import { db } from "../db"
import { user } from "../db/schema"
import type { AuthContext } from "../types"
import { success, unauthorized, internalError, logError } from "../utils/errors"

// Helper function to generate a unique username
async function generateUniqueUsername(
  baseUsername: string,
  maxAttempts: number = 10
): Promise<string> {
  // Clean the base username:
  // 1. Convert to lowercase
  // 2. Replace spaces with nothing
  // 3. Remove special characters but keep letters from any language (Unicode aware)
  let cleanUsername = baseUsername
    .toLowerCase()
    .replace(/\s/g, "")  // Remove spaces
    .replace(/[^\p{L}\p{N}]/gu, "")  // Keep all letters (any language) and numbers
    .slice(0, 20)

  if (!cleanUsername) {
    cleanUsername = "user"
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.username, cleanUsername),
  })

  if (!existingUser) {
    return cleanUsername
  }

  for (let i = 0; i < maxAttempts; i++) {
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    const tryUsername = `${cleanUsername.slice(0, 16)}${randomSuffix}`

    const existing = await db.query.user.findFirst({
      where: eq(user.username, tryUsername),
    })

    if (!existing) {
      return tryUsername
    }
  }

  const timestamp = Date.now().toString(36)
  return `${cleanUsername.slice(0, 10)}${timestamp}`
}

const app = new Hono<AuthContext>()

// Get current user info (with full profile)
app.get("/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return unauthorized(c)
  }

  // Fetch full user record from database
  let [userRecord] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      emailVerified: user.emailVerified,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  // Safety net: Auto-generate username if missing
  if (userRecord && (!userRecord.username || userRecord.username === "")) {
    console.log("[/me] User missing username, auto-generating...")
    let baseUsername: string
    if (userRecord.name) {
      baseUsername = userRecord.name
    } else if (userRecord.email) {
      baseUsername = userRecord.email.split("@")[0]
    } else {
      baseUsername = "user"
    }

    const uniqueUsername = await generateUniqueUsername(baseUsername)

    // Update user with generated username
    await db
      .update(user)
      .set({ username: uniqueUsername })
      .where(eq(user.id, userRecord.id))

    userRecord = { ...userRecord, username: uniqueUsername }
    console.log("[/me] Generated and saved username:", uniqueUsername)
  }

  return success(c, { user: userRecord || session.user })
})

// Get full user profile
app.get("/user/profile", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return unauthorized(c)
  }

  let [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!userRecord) {
    return c.json({ error: "User not found" }, 404)
  }

  // Safety net: Auto-generate username if missing
  if (!userRecord.username || userRecord.username === "") {
    console.log("[/user/profile] User missing username, auto-generating...")
    let baseUsername: string
    if (userRecord.name) {
      baseUsername = userRecord.name
    } else if (userRecord.email) {
      baseUsername = userRecord.email.split("@")[0]
    } else {
      baseUsername = "user"
    }

    const uniqueUsername = await generateUniqueUsername(baseUsername)

    await db
      .update(user)
      .set({ username: uniqueUsername })
      .where(eq(user.id, userRecord.id))

    userRecord = { ...userRecord, username: uniqueUsername }
    console.log("[/user/profile] Generated and saved username:", uniqueUsername)
  }

  return success(c, { user: userRecord })
})

// Update user profile
app.put("/user/profile", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return unauthorized(c)
  }

  const body = await c.req.json()

  // Validate input - only allow certain fields
  const allowedFields = ["name", "username", "bio", "website", "github", "x", "telegram", "image"]
  const updateData: Record<string, string | null> = {}

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  // Check username uniqueness if being updated
  if (updateData.username) {
    const [currentUserRecord] = await db
      .select({ username: user.username })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    const currentUsername = currentUserRecord?.username

    if (updateData.username !== currentUsername) {
      const [existingUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, updateData.username))
        .limit(1)

      if (existingUser) {
        return c.json({ error: "Username already taken" }, 409)
      }
    }
  }

  try {
    const [updated] = await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning()

    return success(c, { user: updated })
  } catch (error) {
    logError("UpdateProfile", error)
    return internalError(c, "Failed to update profile")
  }
})

// Check if username is available
app.get("/user/check-username/:username", async (c) => {
  const username = c.req.param("username")
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  try {
    let currentUsername: string | null = null
    if (session) {
      const [currentUserRecord] = await db
        .select({ username: user.username })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)
      currentUsername = currentUserRecord?.username ?? null
    }

    if (username === currentUsername) {
      return success(c, { available: true, username, current: true })
    }

    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, username))
      .limit(1)

    return success(c, {
      available: !existingUser,
      username,
      current: false,
    })
  } catch (error) {
    logError("CheckUsername", error)
    return internalError(c, "Failed to check username")
  }
})

export default app
