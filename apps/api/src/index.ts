import app from "./app"

const port = process.env.PORT || 3001

Bun.serve({
  fetch: app.fetch,
  port: Number(port),
})

console.log(`🚀 API Server running at http://localhost:${port}`)
