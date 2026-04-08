import type { Design } from "@/lib/types/design"
import { api } from "@/lib/api/client"

// Get public designs
export async function getPublicDesigns(category?: string): Promise<Array<Design>> {
  const url = category 
    ? `/api/designs?category=${encodeURIComponent(category)}`
    : "/api/designs"
  const response = await api.get<{ designs: Array<Design> }>(url)
  return response.designs
}

// Get trending designs
export async function getTrendingDesigns(): Promise<Array<Design>> {
  const response = await api.get<{ designs: Array<Design> }>("/api/designs/leaderboard/trending")
  return response.designs
}

// Get top rated designs
export async function getTopRatedDesigns(): Promise<Array<Design>> {
  const response = await api.get<{ designs: Array<Design> }>("/api/designs/leaderboard/top")
  return response.designs
}

// Get newest designs
export async function getNewestDesigns(): Promise<Array<Design>> {
  const response = await api.get<{ designs: Array<Design> }>("/api/designs/leaderboard/newest")
  return response.designs
}

// Get design by username and slug
export async function getDesignBySlug(username: string, slug: string): Promise<Design> {
  const response = await api.get<{ design: Design }>(`/api/designs/${username}/${slug}`)
  return response.design
}

// Get star count for a design
export async function getStarCount(designId: string): Promise<number> {
  const response = await api.get<{ count: number }>(`/api/stars/count/${designId}`)
  return response.count
}
