import { createAuthClient } from "better-auth/react"

const isDev = import.meta.env.DEV
const API_URL = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:3001" : null)

if (!API_URL && !isDev) {
  console.error("VITE_API_URL is not set in production! Auth will not work correctly.")
  throw new Error("VITE_API_URL environment variable is required in production")
}

// Auth client initialized

export const authClient = createAuthClient({
  baseURL: API_URL || "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
