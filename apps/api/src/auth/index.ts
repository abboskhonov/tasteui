import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { user } from "../db/schema"

// Helper function to generate a unique username
async function generateUniqueUsername(
  baseUsername: string,
  maxAttempts: number = 10
): Promise<string> {
  // Clean the base username:
  // 1. Convert to lowercase
  // 2. Replace spaces with nothing
  // 3. Remove special characters but keep letters from any language (Unicode aware)
  let cleanUsername = baseUsername
    .toLowerCase()
    .replace(/\s/g, "")  // Remove spaces
    .replace(/[^\p{L}\p{N}]/gu, "")  // Keep all letters (any language) and numbers, remove special chars
    .slice(0, 20)

  // If empty after cleaning, use "user"
  if (!cleanUsername) {
    cleanUsername = "user"
  }

  // Try the clean username first
  const existingUser = await db.query.user.findFirst({
    where: eq(user.username, cleanUsername),
  })

  if (!existingUser) {
    return cleanUsername
  }

  // If taken, try adding random numbers
  for (let i = 0; i < maxAttempts; i++) {
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    const tryUsername = `${cleanUsername.slice(0, 16)}${randomSuffix}`

    const existing = await db.query.user.findFirst({
      where: eq(user.username, tryUsername),
    })

    if (!existing) {
      return tryUsername
    }
  }

  // Fallback: use timestamp
  const timestamp = Date.now().toString(36)
  const fallbackUsername = `${cleanUsername.slice(0, 10)}${timestamp}`
  return fallbackUsername
}

// Lazy getter for env vars to ensure they're read fresh
function getApiBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:3001"
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || "http://localhost:3000"
}

const isProduction = process.env.NODE_ENV === "production"

// Parse trusted origins from environment or use defaults
const trustedOriginsEnv = process.env.TRUSTED_ORIGINS
const trustedOrigins = trustedOriginsEnv
  ? trustedOriginsEnv.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]

// Add production domains if in production
const frontendUrl = getFrontendUrl()
if (isProduction && frontendUrl) {
  if (!trustedOrigins.includes(frontendUrl)) {
    trustedOrigins.push(frontendUrl)
  }
}

const apiBaseUrl = getApiBaseUrl()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    usePlural: false,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (userData, ctx) => {
          // If username is already provided, don't generate one
          if (userData.username) {
            return { data: userData, context: ctx }
          }

          // Generate username from name or email
          let baseUsername: string
          if (userData.name) {
            baseUsername = userData.name
          } else if (userData.email) {
            baseUsername = userData.email.split("@")[0]
          } else {
            baseUsername = "user"
          }

          const uniqueUsername = await generateUniqueUsername(baseUsername)

          return {
            data: {
              ...userData,
              username: uniqueUsername,
            },
            context: ctx,
          }
        },
      },
    },
  },
  baseURL: apiBaseUrl,
  basePath: "/api/auth",
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${apiBaseUrl}/api/auth/callback/github`,
      getUserInfo: async (tokens) => {
        // Fetch basic user profile
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        if (!userResponse.ok) {
          throw new Error(`GitHub API error: ${userResponse.status}`)
        }

        const user: any = await userResponse.json()

        // Try to get email from public profile first
        let email = user.email

        // If no public email, fetch from emails endpoint
        if (!email && tokens.accessToken) {
          try {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            })

            if (emailsResponse.ok) {
              const emailsData = await emailsResponse.json()

              if (Array.isArray(emailsData) && emailsData.length > 0) {
                // Find primary email, or first verified, or just first
                const primary = emailsData.find((e: any) => e.primary && e.verified)
                const verified = emailsData.find((e: any) => e.verified)
                email = primary?.email || verified?.email || emailsData[0]?.email
              }
            }
          } catch (err) {
            console.warn("Failed to fetch GitHub emails:", err)
          }
        }

        // If still no email, throw error with helpful message
        if (!email) {
          throw new Error(
            "GitHub did not return an email. " +
            "Please either: 1) Make your email public on GitHub, or " +
            "2) If using GitHub App, enable 'Email addresses' permission to 'Read-only' in your app settings"
          )
        }

        return {
          user: {
            id: user.id.toString(),
            email,
            name: user.name || user.login,
            image: user.avatar_url,
            emailVerified: true,
          },
          data: user,
        }
      },
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${apiBaseUrl}/api/auth/callback/google`,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  advanced: {
    // Cookie settings for cross-domain OAuth and SSR
    // In development: sameSite "lax" with http is fine for SSR when cookies are forwarded
    // In production: sameSite "none" with secure is needed for cross-domain
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
      // Add explicit domain handling for local development
      ...(isProduction ? {} : { domain: undefined }),
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    // Enable cookie forwarding for SSR
    useSecureCookies: isProduction,
  },
})

// Helper to handle OAuth callback redirects
export async function handleAuthRedirect(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // Check if this is a callback request
  if (url.pathname.includes("/callback/")) {
    // Process the callback
    const response = await auth.handler(request)

    // If successful (not an error), redirect to frontend
    if (response.status === 200 || response.status === 302) {
      const redirectUrl = getFrontendUrl()
      
      // Copy all headers from original response to preserve cookies
      const headers = new Headers(response.headers)
      headers.set("Location", redirectUrl)
      
      // Redirect to frontend WITH cookies
      return new Response(null, {
        status: 302,
        headers: headers,
      })
    }

    return response
  }

  return auth.handler(request)
}
