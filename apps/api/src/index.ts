// Log env vars BEFORE anything else loads
console.log("[Index] process.env.FRONTEND_URL:", process.env.FRONTEND_URL)
console.log("[Index] process.env.API_BASE_URL:", process.env.API_BASE_URL)
console.log("[Index] process.env.NODE_ENV:", process.env.NODE_ENV)
console.log("[Index] All env vars:", Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY')))

import "dotenv/config"
import app from "./app"

const port = process.env.PORT || 3001
const hostname = "0.0.0.0"

Bun.serve({
  fetch: app.fetch,
  port: Number(port),
  hostname,
})

console.log(`🚀 API Server running at http://${hostname}:${port}`)
