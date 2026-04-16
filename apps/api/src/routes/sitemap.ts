import { Hono } from "hono"
import { eq, and, desc, sql } from "drizzle-orm"
import { db } from "../db"
import { user, design } from "../db/schema"
import type { AuthContext } from "../types"
import { internalError, logError } from "../utils/errors"

const app = new Hono<AuthContext>()

// Generate XML sitemap for SEO
app.get("/", async (c) => {
  try {
    const baseUrl = "https://tasteui.dev"
    const now = new Date().toISOString()

    // Static pages with priorities
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/bookmarks", priority: "0.8", changefreq: "daily" },
      { url: "/docs", priority: "0.7", changefreq: "weekly" },
      { url: "/docs/installing", priority: "0.6", changefreq: "monthly" },
      { url: "/docs/publishing", priority: "0.6", changefreq: "monthly" },
    ]

    // Fetch all approved designs with author usernames
    const designsResult = await db.execute(sql`
      SELECT 
        d.slug,
        u.username,
        d.updated_at as "updatedAt"
      FROM ${design} d
      INNER JOIN ${user} u ON d.user_id = u.id
      WHERE d.status = 'approved'
      ORDER BY d.updated_at DESC
    `)

    // Fetch all users with at least one approved design
    const usersResult = await db.execute(sql`
      SELECT DISTINCT
        u.username,
        MAX(d.updated_at) as "updatedAt"
      FROM ${user} u
      INNER JOIN ${design} d ON d.user_id = u.id
      WHERE d.status = 'approved'
      GROUP BY u.id, u.username
      ORDER BY MAX(d.updated_at) DESC
    `)

    const designs = designsResult.rows as Array<{ slug: string; username: string; updatedAt: string }>
    const users = usersResult.rows as Array<{ username: string; updatedAt: string }>

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add user profile pages
    for (const user of users) {
      const lastmod = new Date(user.updatedAt).toISOString()
      sitemap += `  <url>
    <loc>${baseUrl}/u/${user.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
    }

    // Add design detail pages
    for (const design of designs) {
      const lastmod = new Date(design.updatedAt).toISOString()
      sitemap += `  <url>
    <loc>${baseUrl}/s/${design.username}/${design.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    }

    sitemap += `</urlset>`

    // Return XML with proper content type
    c.header("Content-Type", "application/xml")
    c.header("Cache-Control", "public, max-age=3600") // Cache for 1 hour
    return c.body(sitemap)
  } catch (error) {
    logError("Failed to generate sitemap", error)
    return internalError(c, "Failed to generate sitemap")
  }
})

export default app
