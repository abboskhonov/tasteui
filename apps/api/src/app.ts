import { Hono } from "hono"
import { cors } from "hono/cors"
import { config } from "dotenv"
import { auth } from "./auth"
import { user, design, bookmark, designView } from "./db/schema"
import { db } from "./db"
import { eq, desc, and, count, like, or, sql } from "drizzle-orm"
import { randomUUID } from "crypto"
import { uploadFile, generateThumbnailKey, validateThumbnail, generateHtmlKey } from "./storage/r2"
import { extname } from "path"
import { generateSlug } from "./utils/slugs"

// Load environment variables
config()

const app = new Hono()

// Enable CORS and caching headers for frontend - must be first!
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
  })
)

// Cache public GET requests for 60 seconds
app.use("/api/designs", async (c, next) => {
  await next()
  if (c.req.method === "GET") {
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  }
})

app.use("/api/users/*", async (c, next) => {
  await next()
  if (c.req.method === "GET") {
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  }
})

// Better Auth - Mount all auth routes
app.all("/api/auth/*", async (c) => {
  const url = new URL(c.req.url)
  
  // Handle OAuth callbacks specially to redirect to frontend
  if (url.pathname.includes("/callback/")) {
    // Process the auth callback - this sets the session cookie
    const response = await auth.handler(c.req.raw)
    
    // Check for error parameter in the original request
    const hasError = url.searchParams.get("error")
    
    if (!hasError && (response.status === 200 || response.status === 302)) {
      // Successful auth - copy cookies from the auth response and redirect to frontend
      const headers = new Headers(response.headers)
      headers.set("Location", "http://localhost:3000")
      
      return new Response(null, {
        status: 302,
        headers: headers,
      })
    }
    
    return response
  }
  
  // Regular auth request
  return auth.handler(c.req.raw)
})

// Health check
app.get("/api/health", async (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    auth: "configured",
    cors: "enabled"
  })
})

// Protected route example - returns user with full profile data including username
app.get("/api/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  // Fetch full user record from database to get username and other fields
  const [userRecord] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.image,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  
  return c.json({ user: userRecord || session.user })
})

// Get full user profile
app.get("/api/user/profile", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  
  if (!userRecord) {
    return c.json({ error: "User not found" }, 404)
  }
  
  return c.json({ user: userRecord })
})

// Update user profile
app.put("/api/user/profile", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
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
  
  try {
    const [updated] = await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning()
    
    return c.json({ user: updated })
  } catch (error) {
    console.error("Error updating profile:", error)
    return c.json({ error: "Failed to update profile" }, 500)
  }
})

// Create a new design
app.post("/api/designs", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const body = await c.req.json()
  
  // Validation
  if (!body.name || !body.name.trim()) {
    return c.json({ error: "Name is required" }, 400)
  }
  
  if (!body.category) {
    return c.json({ error: "Category is required" }, 400)
  }
  
  if (!body.content || !body.content.trim()) {
    return c.json({ error: "Content is required" }, 400)
  }
  
  try {
    // Generate unique slug for this user
    const baseSlug = generateSlug(body.name.trim())
    let slug = baseSlug
    let counter = 1
    
    // Check for existing slugs by this user
    while (true) {
      const [existing] = await db
        .select({ id: design.id })
        .from(design)
        .where(and(
          eq(design.userId, session.user.id),
          eq(design.slug, slug)
        ))
        .limit(1)
      
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    const [designRecord] = await db
      .insert(design)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        name: body.name.trim(),
        slug: slug,
        description: body.description?.trim() || null,
        category: body.category,
        content: body.content.trim(),
        demoUrl: body.demoUrl?.trim() || null,
        thumbnailUrl: body.thumbnailUrl?.trim() || null,
        isPublic: body.isPublic ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    
    return c.json({ design: designRecord }, 201)
  } catch (error) {
    console.error("Error creating design:", error)
    return c.json({ error: "Failed to create design" }, 500)
  }
})

// Get user's designs
app.get("/api/designs/my", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const designs = await db
      .select()
      .from(design)
      .where(eq(design.userId, session.user.id))
      .orderBy(desc(design.createdAt))
    
    return c.json({ designs })
  } catch (error) {
    console.error("Error fetching designs:", error)
    return c.json({ error: "Failed to fetch designs" }, 500)
  }
})

// Get public designs with pagination
app.get("/api/designs", async (c) => {
  const category = c.req.query("category")
  const search = c.req.query("search")
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50) // Max 50
  const offset = parseInt(c.req.query("offset") || "0")
  
  console.log("API /api/designs received:", { category, search, limit, offset })
  
  try {
    const conditions: (import("drizzle-orm").SQL | undefined)[] = [eq(design.isPublic, true)]
    
    if (category) {
      conditions.push(eq(design.category, category))
    }
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`
      console.log("Search pattern:", searchPattern)
      conditions.push(
        or(
          like(design.name, searchPattern),
          like(design.category, searchPattern),
          like(design.description, searchPattern)
        )
      )
    }
    
    console.log("Query conditions count:", conditions.length)
    
    const designs = await db
      .select({
        id: design.id,
        name: design.name,
        slug: design.slug,
        description: design.description,
        category: design.category,
        thumbnailUrl: design.thumbnailUrl,
        isPublic: design.isPublic,
        viewCount: design.viewCount,
        createdAt: design.createdAt,
        userId: design.userId,
        author: {
          name: user.name,
          username: user.username,
          image: user.image,
        }
      })
      .from(design)
      .leftJoin(user, eq(design.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(design.createdAt))
      .limit(limit)
      .offset(offset)
    
    console.log("Query returned designs count:", designs.length)
    if (designs.length > 0) {
      console.log("First design name:", designs[0].name)
    }
    
    return c.json({ designs, pagination: { limit, offset, hasMore: designs.length === limit } })
  } catch (error) {
    console.error("Error fetching designs:", error)
    return c.json({ error: "Failed to fetch designs" }, 500)
  }
})

// Get single design by ID (for editing)
app.get("/api/designs/:id", async (c) => {
  const id = c.req.param("id")
  
  // Check auth for editing
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const [designRecord] = await db
      .select({
        id: design.id,
        name: design.name,
        slug: design.slug,
        description: design.description,
        category: design.category,
        content: design.content,
        demoUrl: design.demoUrl,
        thumbnailUrl: design.thumbnailUrl,
        isPublic: design.isPublic,
        viewCount: design.viewCount,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
        userId: design.userId,
        author: {
          name: user.name,
          username: user.username,
          image: user.image,
        }
      })
      .from(design)
      .leftJoin(user, eq(design.userId, user.id))
      .where(and(
        eq(design.id, id),
        eq(design.userId, session.user.id)
      ))
      .limit(1)
    
    if (!designRecord) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    return c.json({ design: designRecord })
  } catch (error) {
    console.error("Error fetching design:", error)
    return c.json({ error: "Failed to fetch design" }, 500)
  }
})

// Get single design by username and slug (for public viewing)
app.get("/api/designs/:username/:slug", async (c) => {
  const username = c.req.param("username")
  const slug = c.req.param("slug")
  
  try {
    const [designRecord] = await db
      .select({
        id: design.id,
        name: design.name,
        slug: design.slug,
        description: design.description,
        category: design.category,
        content: design.content,
        demoUrl: design.demoUrl,
        thumbnailUrl: design.thumbnailUrl,
        isPublic: design.isPublic,
        viewCount: design.viewCount,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
        userId: design.userId,
        author: {
          name: user.name,
          username: user.username,
          image: user.image,
        }
      })
      .from(design)
      .leftJoin(user, eq(design.userId, user.id))
      .where(and(
        eq(user.username, username),
        eq(design.slug, slug)
      ))
      .limit(1)
    
    if (!designRecord) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    // Check if design is public or user is the owner
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })
    
    if (!designRecord.isPublic && (!session || session.user.id !== designRecord.userId)) {
      return c.json({ error: "Unauthorized" }, 403)
    }
    
    return c.json({ design: designRecord })
  } catch (error) {
    console.error("Error fetching design:", error)
    return c.json({ error: "Failed to fetch design" }, 500)
  }
})

// Record a view for a design (with deduplication - 24h window)
app.post("/api/designs/:id/view", async (c) => {
  const designId = c.req.param("id")
  
  try {
    // Check if design exists and is public
    const [designRecord] = await db
      .select({ id: design.id, isPublic: design.isPublic, userId: design.userId })
      .from(design)
      .where(eq(design.id, designId))
      .limit(1)
    
    if (!designRecord) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    // Get current user session (optional - anonymous views allowed)
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })
    
    const userId = session?.user?.id
    
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Check if this user/ip has viewed in the last 24 hours
    let existingView
    
    if (userId) {
      // For logged-in users: check by userId - get most recent view
      [existingView] = await db
        .select()
        .from(designView)
        .where(and(
          eq(designView.designId, designId),
          eq(designView.userId, userId)
        ))
        .orderBy(desc(designView.viewedAt))
        .limit(1)
      
      // Check if the last view was within 24h
      if (existingView && existingView.viewedAt > twentyFourHoursAgo) {
        return c.json({ 
          success: true, 
          isNewView: false,
          viewCount: designRecord.isPublic ? await getPublicViewCount(designId) : 0 
        })
      }
    }
    
    // Record the new view
    await db.insert(designView).values({
      id: randomUUID(),
      designId,
      userId: userId || null,
      viewedAt: new Date(),
    })
    
    // Increment the design view count
    await db
      .update(design)
      .set({ 
        viewCount: sql`${design.viewCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(design.id, designId))
    
    // Get updated count
    const viewCount = designRecord.isPublic ? await getPublicViewCount(designId) : 0
    
    return c.json({ 
      success: true, 
      isNewView: true,
      viewCount 
    })
  } catch (error) {
    console.error("Error recording view:", error)
    return c.json({ error: "Failed to record view" }, 500)
  }
})

// Helper to get view count
async function getPublicViewCount(designId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(designView)
    .where(eq(designView.designId, designId))
  
  return Number(result?.count || 0)
}

// Get view analytics for user's designs (last 7 days)
app.get("/api/analytics/views", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    // Get user's designs first
    const userDesigns = await db
      .select({ id: design.id })
      .from(design)
      .where(eq(design.userId, session.user.id))
    
    const designIds = userDesigns.map(d => d.id)
    
    if (designIds.length === 0) {
      return c.json({ 
        dailyViews: Array(7).fill(0),
        totalViews: 0
      })
    }
    
    // Calculate last 7 days
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      days.push(date)
    }
    
    // Get views for each day using raw SQL with proper parameter binding
    const dailyViews = await Promise.all(
      days.map(async (day) => {
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)
        
        // Use raw query with proper date formatting
        const dayStr = day.toISOString()
        const nextDayStr = nextDay.toISOString()
        
        const result = await db.execute(sql`
          SELECT COUNT(*) as count 
          FROM design_view 
          WHERE design_id IN (${sql.join(designIds.map(id => sql`${id}`), sql`, `)})
            AND viewed_at >= ${dayStr}::timestamp
            AND viewed_at < ${nextDayStr}::timestamp
        `)
        
        return Number(result.rows[0]?.count || 0)
      })
    )
    
    // Get total views
    const totalResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM design_view 
      WHERE design_id IN (${sql.join(designIds.map(id => sql`${id}`), sql`, `)})
    `)
    
    return c.json({
      dailyViews,
      totalViews: Number(totalResult.rows[0]?.count || 0)
    })
  } catch (error) {
    console.error("Error fetching view analytics:", error)
    return c.json({ error: "Failed to fetch analytics" }, 500)
  }
})

// Get public user profile by username
app.get("/api/users/:username", async (c) => {
  const username = c.req.param("username")
  
  try {
    // Get user profile first
    const [userRecord] = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        website: user.website,
        github: user.github,
        x: user.x,
        telegram: user.telegram,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.username, username))
      .limit(1)
    
    if (!userRecord) {
      return c.json({ error: "User not found" }, 404)
    }
    
    // Run designs and count queries in parallel
    const [designs, [{ count: designCount }]] = await Promise.all([
      db
        .select({
          id: design.id,
          name: design.name,
          slug: design.slug,
          description: design.description,
          category: design.category,
          thumbnailUrl: design.thumbnailUrl,
          isPublic: design.isPublic,
          viewCount: design.viewCount,
          createdAt: design.createdAt,
        })
        .from(design)
        .where(and(
          eq(design.userId, userRecord.id),
          eq(design.isPublic, true)
        ))
        .orderBy(desc(design.createdAt))
        .limit(50), // Add limit for profile page
      db
        .select({ count: count() })
        .from(design)
        .where(and(
          eq(design.userId, userRecord.id),
          eq(design.isPublic, true)
        ))
    ])
    
    return c.json({
      user: userRecord,
      designs,
      stats: {
        components: designCount,
        followers: 0, // TODO: Add followers feature
        following: 0, // TODO: Add following feature
      }
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return c.json({ error: "Failed to fetch user profile" }, 500)
  }
})

// Update design
app.put("/api/designs/:id", async (c) => {
  const id = c.req.param("id")
  
  // Check auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const body = await c.req.json()
    const { name, description, category, content, demoUrl, thumbnailUrl, isPublic } = body
    
    // Check if design exists and user owns it
    const [existingDesign] = await db
      .select()
      .from(design)
      .where(eq(design.id, id))
      .limit(1)
    
    if (!existingDesign) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    if (existingDesign.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403)
    }
    
    // Update design
    const [updatedDesign] = await db
      .update(design)
      .set({
        name: name || existingDesign.name,
        description: description !== undefined ? description : existingDesign.description,
        category: category || existingDesign.category,
        content: content || existingDesign.content,
        demoUrl: demoUrl !== undefined ? demoUrl : existingDesign.demoUrl,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existingDesign.thumbnailUrl,
        isPublic: isPublic !== undefined ? isPublic : existingDesign.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(design.id, id))
      .returning()
    
    return c.json({ design: updatedDesign })
  } catch (error) {
    console.error("Error updating design:", error)
    return c.json({ error: "Failed to update design" }, 500)
  }
})

// Toggle design visibility
app.patch("/api/designs/:id/visibility", async (c) => {
  const id = c.req.param("id")
  
  // Check auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const body = await c.req.json()
    const { isPublic } = body
    
    // Check if design exists and user owns it
    const [existingDesign] = await db
      .select()
      .from(design)
      .where(eq(design.id, id))
      .limit(1)
    
    if (!existingDesign) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    if (existingDesign.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403)
    }
    
    // Update visibility
    const [updatedDesign] = await db
      .update(design)
      .set({
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(design.id, id))
      .returning()
    
    return c.json({ design: updatedDesign })
  } catch (error) {
    console.error("Error updating design visibility:", error)
    return c.json({ error: "Failed to update visibility" }, 500)
  }
})

// Delete design
app.delete("/api/designs/:id", async (c) => {
  const id = c.req.param("id")
  
  // Check auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    // Check if design exists and user owns it
    const [existingDesign] = await db
      .select()
      .from(design)
      .where(eq(design.id, id))
      .limit(1)
    
    if (!existingDesign) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    if (existingDesign.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403)
    }
    
    // Delete design
    await db
      .delete(design)
      .where(eq(design.id, id))
    
    return c.json({ success: true })
  } catch (error) {
    console.error("Error deleting design:", error)
    return c.json({ error: "Failed to delete design" }, 500)
  }
})

// Upload image to R2
app.post("/api/upload/image", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const body = await c.req.parseBody()
    const file = body.file
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400)
    }
    
    // Get file details
    const contentType = file.type || "application/octet-stream"
    const fileExtension = extname(file.name).toLowerCase().replace(".", "") || "jpg"
    
    // Validate file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const validation = validateThumbnail(contentType, buffer.length)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }
    
    // Generate unique key
    const key = generateThumbnailKey(session.user.id, fileExtension)
    
    // Upload to R2
    const result = await uploadFile(buffer, key, contentType)
    
    return c.json({
      url: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      500
    )
  }
})

// Upload HTML content to R2
app.post("/api/upload/html", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const body = await c.req.json()
    const { html } = body
    
    if (!html || typeof html !== "string") {
      return c.json({ error: "No HTML content provided" }, 400)
    }
    
    // Validate HTML size (max 1MB)
    const htmlBuffer = Buffer.from(html, "utf-8")
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (htmlBuffer.length > maxSize) {
      return c.json({ error: "HTML content too large. Maximum size is 1MB." }, 400)
    }
    
    // Generate unique key
    const key = generateHtmlKey(session.user.id)
    
    // Upload to R2
    const result = await uploadFile(htmlBuffer, key, "text/html")
    
    return c.json({
      url: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    })
  } catch (error) {
    console.error("Error uploading HTML:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to upload HTML" },
      500
    )
  }
})

// Get user's bookmarks
app.get("/api/bookmarks", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  try {
    const bookmarks = await db
      .select({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        designId: design.id,
        designName: design.name,
        designSlug: design.slug,
        designDescription: design.description,
        designCategory: design.category,
        designThumbnailUrl: design.thumbnailUrl,
        designViewCount: design.viewCount,
        designCreatedAt: design.createdAt,
        authorName: user.name,
        authorUsername: user.username,
        authorImage: user.image,
      })
      .from(bookmark)
      .innerJoin(design, eq(bookmark.designId, design.id))
      .innerJoin(user, eq(design.userId, user.id))
      .where(eq(bookmark.userId, session.user.id))
      .orderBy(desc(bookmark.createdAt))
    
    return c.json({ bookmarks })
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return c.json({ error: "Failed to fetch bookmarks" }, 500)
  }
})

// Check if a design is bookmarked
app.get("/api/bookmarks/check/:designId", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const designId = c.req.param("designId")
  
  try {
    const [existingBookmark] = await db
      .select()
      .from(bookmark)
      .where(and(
        eq(bookmark.userId, session.user.id),
        eq(bookmark.designId, designId)
      ))
      .limit(1)
    
    return c.json({ isBookmarked: !!existingBookmark })
  } catch (error) {
    console.error("Error checking bookmark:", error)
    return c.json({ error: "Failed to check bookmark" }, 500)
  }
})

// Create a bookmark
app.post("/api/bookmarks", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const body = await c.req.json()
  const { designId } = body
  
  if (!designId) {
    return c.json({ error: "Design ID is required" }, 400)
  }
  
  try {
    // Check if design exists
    const [designRecord] = await db
      .select()
      .from(design)
      .where(eq(design.id, designId))
      .limit(1)
    
    if (!designRecord) {
      return c.json({ error: "Design not found" }, 404)
    }
    
    // Check if already bookmarked
    const [existingBookmark] = await db
      .select()
      .from(bookmark)
      .where(and(
        eq(bookmark.userId, session.user.id),
        eq(bookmark.designId, designId)
      ))
      .limit(1)
    
    if (existingBookmark) {
      return c.json({ bookmark: existingBookmark })
    }
    
    // Create bookmark
    const [newBookmark] = await db
      .insert(bookmark)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        designId: designId,
        createdAt: new Date(),
      })
      .returning()
    
    return c.json({ bookmark: newBookmark }, 201)
  } catch (error) {
    console.error("Error creating bookmark:", error)
    return c.json({ error: "Failed to create bookmark" }, 500)
  }
})

// Delete a bookmark
app.delete("/api/bookmarks/:designId", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const designId = c.req.param("designId")
  
  try {
    await db
      .delete(bookmark)
      .where(and(
        eq(bookmark.userId, session.user.id),
        eq(bookmark.designId, designId)
      ))
    
    return c.json({ success: true })
  } catch (error) {
    console.error("Error deleting bookmark:", error)
    return c.json({ error: "Failed to delete bookmark" }, 500)
  }
})

export default app
