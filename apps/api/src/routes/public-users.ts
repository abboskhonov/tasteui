import { Hono } from "hono"
import { eq, and, desc, count, sql } from "drizzle-orm"
import { db } from "../db"
import { user, design } from "../db/schema"
import type { AuthContext } from "../types"
import { success, notFound, internalError, logError } from "../utils/errors"

const app = new Hono<AuthContext>()

// Get public user profile by username
// OPTIMIZED: Single query for user + designs + count
app.get("/:username", async (c) => {
  const username = c.req.param("username")

  try {
    // Single optimized query that gets user, their designs, and count in one go
    const result = await db.execute(sql`
      WITH user_data AS (
        SELECT 
          id,
          name,
          username,
          image,
          bio,
          website,
          github,
          x,
          telegram,
          created_at as "createdAt"
        FROM ${user}
        WHERE username = ${username}
        LIMIT 1
      ),
      user_designs AS (
        SELECT 
          d.id,
          d.name,
          d.slug,
          d.description,
          d.category,
          d.thumbnail_url as "thumbnailUrl",
          d.status,
          d.view_count as "viewCount",
          d.created_at as "createdAt"
        FROM ${design} d
        INNER JOIN user_data u ON d.user_id = u.id
        WHERE d.status = 'approved'
        ORDER BY d.created_at DESC
        LIMIT 50
      ),
      design_count AS (
        SELECT COUNT(*) as count
        FROM ${design} d
        INNER JOIN user_data u ON d.user_id = u.id
        WHERE d.status = 'approved'
      )
      SELECT 
        (SELECT json_build_object(
          'id', id,
          'name', name,
          'username', username,
          'image', image,
          'bio', bio,
          'website', website,
          'github', github,
          'x', x,
          'telegram', telegram,
          'createdAt', "createdAt"
        ) FROM user_data) as user,
        (SELECT json_agg(json_build_object(
          'id', id,
          'name', name,
          'slug', slug,
          'description', description,
          'category', category,
          'thumbnailUrl', "thumbnailUrl",
          'status', status,
          'viewCount', "viewCount",
          'createdAt', "createdAt"
        )) FROM user_designs) as designs,
        (SELECT count FROM design_count) as "designCount"
    `)

    if (result.rows.length === 0) {
      return notFound(c, "User")
    }

    const row = result.rows[0] as { 
      user: unknown
      designs: unknown[] | null
      designCount: string | number
    }

    if (!row.user) {
      return notFound(c, "User")
    }

    return success(c, {
      user: row.user,
      designs: row.designs || [],
      stats: {
        components: Number(row.designCount || 0),
        followers: 0,
        following: 0,
      }
    })
  } catch (error) {
    logError("FetchUserProfile", error)
    return internalError(c, "Failed to fetch user profile")
  }
})

export default app
