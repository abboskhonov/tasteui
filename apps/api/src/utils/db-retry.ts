import { db } from "../db"

/**
 * Retry a database operation with exponential backoff
 * Useful for handling transient connection issues in serverless environments
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 100
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Only retry on connection errors
      const isRetryable = 
        lastError.message.includes("Connection terminated") ||
        lastError.message.includes("connection") ||
        lastError.message.includes("timeout") ||
        lastError.message.includes("ECONNRESET")
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`Database operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Example usage wrapper for common query patterns
export async function queryWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  return withRetry(operation, 3, 100)
}
