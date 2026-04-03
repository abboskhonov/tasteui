import { createServerFn } from "@tanstack/react-start"
import type { Design } from "@/lib/types/design"

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3001"

export const getPublicDesignsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const response = await fetch(`${API_BASE_URL}/api/designs`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch designs")
    }
    
    const data = await response.json()
    return data.designs as Design[]
  })
