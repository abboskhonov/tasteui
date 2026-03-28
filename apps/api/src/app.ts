import { Hono } from "hono"
import { cors } from "hono/cors"
import { config } from "dotenv"
import { auth } from "./auth"

// Load environment variables
config()

const app = new Hono()

// Enable CORS for frontend - must be first!
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

// Better Auth - Mount all auth routes
app.all("/api/auth/*", async (c) => {
  const url = new URL(c.req.url)
  
  // Handle OAuth callbacks specially to redirect to frontend
  if (url.pathname.includes("/callback/")) {
    // Process the auth callback
    const response = await auth.handler(c.req.raw)
    
    // If successful, redirect to frontend
    if (response.status === 200 || response.status === 302) {
      // Check if it's a success response by looking for error param
      const hasError = url.searchParams.get("error")
      
      if (!hasError) {
        // Successful auth - redirect to frontend
        return c.redirect("http://localhost:3000", 302)
      }
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

// Protected route example
app.get("/api/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  return c.json({ user: session.user })
})

export default app
