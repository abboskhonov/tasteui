import { db } from "../db"
import { user, design } from "../db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { generateSlug, generateUsername } from "../utils/slugs"

/**
 * Migration script to backfill usernames and slugs for existing data
 * Run with: cd apps/api && bun run db:backfill
 */

async function backfillUsernames() {
  console.log("Backfilling usernames...")
  
  const usersWithoutUsername = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(isNull(user.username))
  
  console.log(`Found ${usersWithoutUsername.length} users without username`)
  
  for (const userRecord of usersWithoutUsername) {
    // Generate username from name or email
    const baseUsername = userRecord.name 
      ? generateUsername(userRecord.name)
      : generateUsername(userRecord.email.split("@")[0])
    
    // Ensure uniqueness
    let username = baseUsername
    let counter = 1
    
    while (true) {
      const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, username))
        .limit(1)
      
      if (!existing) break
      username = `${baseUsername}-${counter}`
      counter++
    }
    
    await db
      .update(user)
      .set({ username, updatedAt: new Date() })
      .where(eq(user.id, userRecord.id))
    
    console.log(`  Updated user ${userRecord.id}: username = ${username}`)
  }
  
  console.log("✓ Usernames backfilled")
}

async function backfillSlugs() {
  console.log("Backfilling slugs...")
  
  const designsWithoutSlug = await db
    .select({
      id: design.id,
      name: design.name,
      userId: design.userId,
    })
    .from(design)
    .where(isNull(design.slug))
  
  console.log(`Found ${designsWithoutSlug.length} designs without slug`)
  
  for (const designRecord of designsWithoutSlug) {
    // Generate base slug from name
    const baseSlug = generateSlug(designRecord.name)
    
    // Ensure uniqueness per user
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const [existing] = await db
        .select({ id: design.id })
        .from(design)
        .where(and(
          eq(design.userId, designRecord.userId),
          eq(design.slug, slug)
        ))
        .limit(1)
      
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    await db
      .update(design)
      .set({ slug, updatedAt: new Date() })
      .where(eq(design.id, designRecord.id))
    
    console.log(`  Updated design ${designRecord.id}: slug = ${slug}`)
  }
  
  console.log("✓ Slugs backfilled")
}

async function main() {
  console.log("Starting data backfill...\n")
  
  try {
    await backfillUsernames()
    console.log()
    await backfillSlugs()
    console.log("\n✅ Backfill complete!")
  } catch (error) {
    console.error("❌ Backfill failed:", error)
    process.exit(1)
  }
  
  process.exit(0)
}

main()