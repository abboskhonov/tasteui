import "dotenv/config"
import app from "./app"

const port = process.env.PORT || 3001
const hostname = "0.0.0.0"

Bun.serve({
  fetch: app.fetch,
  port: Number(port),
  hostname,
})

console.log(`🚀 API Server running on port ${port}`)
