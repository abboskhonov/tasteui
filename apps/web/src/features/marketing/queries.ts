import {  useQuery } from "@tanstack/react-query"
import {
  getDesignBySlug,
  getNewestDesigns,
  getPublicDesigns,
  getStarCount,
  getTopRatedDesigns,
  getTrendingDesigns,
} from "./apis"
import type {QueryClient} from "@tanstack/react-query";
import { designKeys } from "@/lib/queries/designs"


// Query keys for marketing feature
export const marketingKeys = {
  all: ["marketing"] as const,
  designs: () => [...marketingKeys.all, "designs"] as const,
  public: (category?: string) => [...marketingKeys.designs(), "public", category] as const,
  trending: () => [...marketingKeys.designs(), "trending"] as const,
  topRated: () => [...marketingKeys.designs(), "top-rated"] as const,
  newest: () => [...marketingKeys.designs(), "newest"] as const,
}

// Hook for public designs
export function useMarketingDesigns(category?: string) {
  return useQuery({
    queryKey: marketingKeys.public(category),
    queryFn: () => getPublicDesigns(category),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

// Hook for trending designs
export function useTrendingDesigns() {
  return useQuery({
    queryKey: marketingKeys.trending(),
    queryFn: getTrendingDesigns,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

// Hook for top rated designs
export function useTopRatedDesigns() {
  return useQuery({
    queryKey: marketingKeys.topRated(),
    queryFn: getTopRatedDesigns,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

// Hook for newest designs
export function useNewestDesigns() {
  return useQuery({
    queryKey: marketingKeys.newest(),
    queryFn: getNewestDesigns,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

// Prefetch helpers
export async function prefetchDesignDetail(
  queryClient: QueryClient,
  username: string,
  slug: string,
  designId?: string
) {
  // Prefetch main design data
  const designPromise = queryClient.prefetchQuery({
    queryKey: designKeys.detail(username, slug),
    queryFn: () => getDesignBySlug(username, slug),
    staleTime: 1000 * 60 * 10,
  })

  // Prefetch star count if we have designId
  if (designId) {
    queryClient.prefetchQuery({
      queryKey: designKeys.starCount(designId),
      queryFn: () => getStarCount(designId),
      staleTime: 1000 * 60 * 10,
    })
  }

  await designPromise
}

export function batchPrefetchDesigns(
  queryClient: QueryClient,
  designs: Array<{ id: string; slug: string; author?: { username: string | null } }>,
  staggerMs: number = 50
): () => void {
  const timeouts: Array<number> = []
  
  designs.forEach((design, index) => {
    const username = design.author?.username || "unknown"
    
    const timeout = window.setTimeout(() => {
      prefetchDesignDetail(queryClient, username, design.slug, design.id)
    }, index * staggerMs)
    
    timeouts.push(timeout)
  })
  
  return () => timeouts.forEach(clearTimeout)
}
