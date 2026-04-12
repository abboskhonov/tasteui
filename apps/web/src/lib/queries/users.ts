import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Design } from "@/lib/types/design"

// User profile type
export interface UserProfile {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  website: string | null
  github: string | null
  x: string | null
  telegram: string | null
  youtube: string | null
  instagram: string | null
  createdAt: string
}

export interface UserStats {
  components: number
  followers: number
  following: number
}

export interface UserProfileResponse {
  user: UserProfile
  designs: Design[]
  stats: UserStats
}

// Query keys
export const userKeys = {
  all: ["users"] as const,
  profile: (username: string) => [...userKeys.all, "profile", username] as const,
}

// Get user profile by username
export function useUserProfile(username: string) {
  const queryClient = useQueryClient()
  // Get cached data for instant rendering
  const cachedData = queryClient.getQueryData<UserProfileResponse>(userKeys.profile(username))
  
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: async () => {
      const response = await api.get<UserProfileResponse>(`/api/users/${username}`)
      return response
    },
    initialData: cachedData,
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  })
}

// Prefetch user profile (for hover on author links)
export async function prefetchUserProfile(
  queryClient: QueryClient,
  username: string
) {
  const queryKey = userKeys.profile(username)
  
  // Only prefetch if not already in cache
  if (!queryClient.getQueryData(queryKey)) {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await api.get<UserProfileResponse>(`/api/users/${username}`)
        return response
      },
      staleTime: 1000 * 60 * 5,
    })
  }
}
