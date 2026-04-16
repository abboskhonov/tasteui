import { db } from "../db"
import { user } from "../db/schema"
import { eq, or, sql } from "drizzle-orm"

// Helper function to generate a unique username (same logic as in auth/index.ts)
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

  // If empty after cleaning, use "user"
  if (!cleanUsername) {
    cleanUsername = "user"
  }

  // Try the clean username first
  const existingUser = await db.query.user.findFirst({
    where: eq(user.username, cleanUsername),
  })

  if (!existingUser) {
    return cleanUsername
  }

  // If taken, try adding random numbers
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

  // Fallback: use timestamp
  const timestamp = Date.now().toString(36)
  return `${cleanUsername.slice(0, 10)}${timestamp}`
}

async function backfillUsernames() {
  console.log("[Backfill] Starting username backfill...")

  // Find all users without a username (null OR empty string)
  const usersWithoutUsername = await db.execute(sql`
    SELECT id, email, name, username
    FROM ${user}
    WHERE username IS NULL OR username = ''
  `)

  console.log(`[Backfill] Found ${usersWithoutUsername.rows.length} users without usernames`)

  for (const userRecord of usersWithoutUsername.rows) {
    // Generate username from name or email
    let baseUsername: string
    if (userRecord.name) {
      baseUsername = userRecord.name as string
    } else if (userRecord.email) {
      baseUsername = (userRecord.email as string).split("@")[0]
    } else {
      baseUsername = "user"
    }

    const uniqueUsername = await generateUniqueUsername(baseUsername)

    // Update the user
    await db.execute(sql`
      UPDATE ${user}
      SET username = ${uniqueUsername}
      WHERE id = ${userRecord.id as string}
    `)

    console.log(`[Backfill] Updated user ${userRecord.id}: ${userRecord.email} -> @${uniqueUsername}`)
  }

  console.log("[Backfill] Username backfill complete!")
  process.exit(0)
}

// Run if executed directly
if (import.meta.main) {
  backfillUsernames().catch((error) => {
    console.error("[Backfill] Error:", error)
    process.exit(1)
  })
}
