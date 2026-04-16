import { Hono } from "hono"
import { extname } from "path"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import {
  uploadFile,
  generateThumbnailKey,
  validateThumbnail,
  generateHtmlKey,
  validateHtmlContent,
  sanitizeHtmlForDisplay,
  getS3Client,
  getConfig,
} from "../storage/r2"
import type { AuthContext } from "../types"
import { success, created, unauthorized, badRequest, internalError, logError, notFound } from "../utils/errors"

const app = new Hono<AuthContext>()

// Maximum file size (5MB for images)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_HTML_SIZE = 1 * 1024 * 1024

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]

// Upload image to R2
app.post("/image", async (c) => {
  const session = c.get("session")

  if (!session) {
    return unauthorized(c)
  }

  try {
    const body = await c.req.parseBody()
    const file = body.file

    if (!file || !(file instanceof File)) {
      return badRequest(c, "No file provided")
    }

    // Validate file size early (before reading entire file)
    if (file.size > MAX_IMAGE_SIZE) {
      return badRequest(c, "File too large. Maximum size is 5MB.")
    }

    const contentType = file.type || "application/octet-stream"
    const fileExtension = extname(file.name).toLowerCase().replace(".", "") || "jpg"

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return badRequest(c, `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`)
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate file content (magic numbers)
    const validation = validateThumbnail(contentType, buffer.length, buffer)
    if (!validation.valid) {
      return badRequest(c, validation.error || "Invalid file")
    }

    // Generate secure key with sanitized extension
    const key = generateThumbnailKey(session.user.id, fileExtension)
    const result = await uploadFile(buffer, key, contentType)

    return created(c, {
      url: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    })
  } catch (error) {
    logError("UploadImage", error)
    return internalError(c, error instanceof Error ? error.message : "Failed to upload image")
  }
})

// Upload HTML content to R2
app.post("/html", async (c) => {
  const session = c.get("session")

  if (!session) {
    return unauthorized(c)
  }

  try {
    const body = await c.req.json()
    const { html } = body

    if (!html || typeof html !== "string") {
      return badRequest(c, "No HTML content provided")
    }

    // Validate HTML size
    const htmlBuffer = Buffer.from(html, "utf-8")
    if (htmlBuffer.length > MAX_HTML_SIZE) {
      return badRequest(c, "HTML content too large. Maximum size is 1MB.")
    }

    // Validate HTML content (security check)
    const contentValidation = validateHtmlContent(html)
    if (!contentValidation.valid) {
      return badRequest(c, contentValidation.error || "Invalid HTML content")
    }

    // Sanitize HTML for safe display
    const sanitizedHtml = sanitizeHtmlForDisplay(html)

    // Generate secure key
    const key = generateHtmlKey(session.user.id)
    const result = await uploadFile(Buffer.from(sanitizedHtml, "utf-8"), key, "text/html", {
      addSecurityHeaders: true,
    })

    // Return proxy URL that serves HTML with proper CORS headers for iframe embedding
    // This ensures the HTML can be displayed in iframes without X-Frame-Options blocking
    const proxyUrl = `${c.req.url.replace(/\/upload\/html$/, '')}/upload/html/${result.key}`

    return created(c, {
      url: proxyUrl,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    })
  } catch (error) {
    logError("UploadHTML", error)
    return internalError(c, error instanceof Error ? error.message : "Failed to upload HTML")
  }
})

// Proxy endpoint to serve HTML content with proper CORS headers for iframe embedding
app.get("/html/:key", async (c) => {
  const key = c.req.param("key")
  
  // Security: Only allow design-previews path
  if (!key.startsWith("design-previews/") || !key.endsWith(".html")) {
    return badRequest(c, "Invalid key")
  }
  
  try {
    const config = getConfig()
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
    
    const response = await getS3Client().send(command)
    
    if (!response.Body) {
      return notFound(c, "HTML content")
    }
    
    // Convert stream to text
    const bytes = await response.Body.transformToByteArray()
    const html = new TextDecoder().decode(bytes)
    
    // Return with proper headers for iframe embedding
    c.header("Content-Type", "text/html; charset=utf-8")
    c.header("X-Content-Type-Options", "nosniff")
    c.header("Referrer-Policy", "strict-origin-when-cross-origin")
    // Allow iframe embedding from any origin (scripts are already stripped)
    c.header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:;")
    
    return c.body(html)
  } catch (error) {
    logError("ServeHTML", error)
    return notFound(c, "HTML content")
  }
})

export default app
