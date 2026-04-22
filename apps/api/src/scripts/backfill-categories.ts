import { db } from "../db"
import { design } from "../db/schema"
import { sql } from "drizzle-orm"

/**
 * Backfill script to set ALL existing design categories to "Marketing"
 * Run with: cd apps/api && bun run db:backfill-categories
 */

const TARGET_CATEGORY = "Marketing"

async function backfillCategories() {
  console.log("[Backfill] Migrating all existing designs to 'Marketing'...")

  const result = await db
    .update(design)
    .set({ category: TARGET_CATEGORY, updatedAt: new Date() })
    .where(sql`1 = 1`) // match every row

  console.log(`[Backfill] Complete! All designs updated to "${TARGET_CATEGORY}".`)
}

backfillCategories().catch((error) => {
  console.error("[Backfill] Failed:", error)
  process.exit(1)
})
