import { Hono } from "hono"
import { extname } from "path"
import {
  uploadFile,
  generateThumbnailKey,
  validateThumbnail,
  generateHtmlKey,
  validateHtmlContent,
  sanitizeHtmlForDisplay,
} from "../storage/r2"
import type { AuthContext } from "../types"
import { success, created, unauthorized, badRequest, internalError, logError } from "../utils/errors"

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
    const result = await uploadFile(htmlBuffer, key, "text/html", {
      addSecurityHeaders: true,
    })

    return created(c, {
      url: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    })
  } catch (error) {
    logError("UploadHTML", error)
    return internalError(c, error instanceof Error ? error.message : "Failed to upload HTML")
  }
})

export default app
