import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateDesignData } from "@/lib/types/design"
import { designKeys } from "@/lib/queries/designs"
import { marketingKeys } from "../marketing/queries"
import {
  getMyDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
  updateDesignStatus,
} from "./api"

// Query keys
export const studioKeys = {
  all: ["studio"] as const,
  designs: () => [...studioKeys.all, "designs"] as const,
  design: (id: string) => [...studioKeys.all, "design", id] as const,
}

// Helper to invalidate all design-related caches
function invalidateDesignCaches(queryClient: ReturnType<typeof useQueryClient>) {
  // Studio cache
  queryClient.invalidateQueries({ queryKey: studioKeys.designs() })
  // Shared design cache (marketing, public galleries, etc.)
  queryClient.invalidateQueries({ queryKey: designKeys.all })
  // Marketing-specific cache
  queryClient.invalidateQueries({ queryKey: marketingKeys.all })
}

// Get user's designs
export function useStudioDesigns() {
  return useQuery({
    queryKey: studioKeys.designs(),
    queryFn: getMyDesigns,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get single design
export function useStudioDesign(id: string) {
  return useQuery({
    queryKey: studioKeys.design(id),
    queryFn: () => getDesign(id),
    enabled: !!id,
  })
}

// Create design
export function useCreateStudioDesign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDesign,
    onSuccess: () => {
      invalidateDesignCaches(queryClient)
    },
  })
}

// Update design
export function useUpdateStudioDesign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDesignData> }) =>
      updateDesign(id, data),
    onSuccess: (_, variables) => {
      invalidateDesignCaches(queryClient)
      queryClient.invalidateQueries({ queryKey: studioKeys.design(variables.id) })
    },
  })
}

// Delete design
export function useDeleteStudioDesign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: () => {
      invalidateDesignCaches(queryClient)
    },
  })
}

// Update design status
export function useUpdateDesignStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "pending" | "approved" }) =>
      updateDesignStatus(id, status),
    onSuccess: (_, variables) => {
      invalidateDesignCaches(queryClient)
      queryClient.invalidateQueries({ queryKey: studioKeys.design(variables.id) })
    },
  })
}
