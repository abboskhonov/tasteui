/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces with hyphens, removes special chars
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Generate username from name or email
 * Removes special chars, converts to lowercase
 */
export function generateUsername(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w]/g, "") // Remove all non-word characters
    .slice(0, 30) // Limit to 30 characters
}

/**
 * Validate username format
 * Must be alphanumeric, 3-30 characters
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]$/.test(username)
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 100
}