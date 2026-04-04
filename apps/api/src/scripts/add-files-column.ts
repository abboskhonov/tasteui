import { db } from "../db"

async function addFilesColumn() {
  try {
    await db.execute(`
      ALTER TABLE "design" ADD COLUMN IF NOT EXISTS "files" text;
    `)
    console.log("✅ files column added successfully")
  } catch (error) {
    console.error("❌ Error adding column:", error)
  }
  process.exit(0)
}

addFilesColumn()
