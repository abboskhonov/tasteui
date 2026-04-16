"use client"

import { useCallback, useEffect, useRef } from "react"
import { PlusIcon } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { batchPrefetchDesigns, useMarketingDesigns } from "../queries"
import { DesignCard, GalleryHeader } from "../components"
import type { GallerySortOption } from "../components"

export function SkillsGallery() {
  const { data: designs, isLoading, error } = useMarketingDesigns()
  const queryClient = useQueryClient()
  const router = useRouter()
  const prefetchedFirstBatch = useRef(false)

  // Eager prefetch: immediately prefetch first 8 designs when data loads
  useEffect(() => {
    if (!designs || designs.length === 0 || prefetchedFirstBatch.current) return
    
    prefetchedFirstBatch.current = true
    
    // Prefetch first 8 designs immediately (above the fold + buffer)
    const firstBatch = designs.slice(0, 8)
    
    // Use requestIdleCallback to not block initial render
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const schedulePrefetch = typeof window !== "undefined" && window.requestIdleCallback 
      ? window.requestIdleCallback 
      : ((cb: () => void) => setTimeout(cb, 1))
    
    schedulePrefetch(() => {
      firstBatch.forEach((design, index) => {
        const username = design.author?.username || "unknown"
        
        // Stagger prefetches to avoid network congestion
        setTimeout(() => {
          // Prefetch route
          router.preloadRoute({
            to: "/s/$username/$designSlug",
            params: { username, designSlug: design.slug }
          })
        }, index * 50) // 50ms stagger
      })
      
      // Batch prefetch data
      const cleanup = batchPrefetchDesigns(queryClient, firstBatch, 50)
      return cleanup
    })
  }, [designs, queryClient, router])

  // Track which designs have been prefetched to avoid duplicates
  const prefetchedDesigns = useRef<Set<string>>(new Set())
  
  const handleDesignVisible = useCallback((designId: string) => {
    if (prefetchedDesigns.current.has(designId)) return
    prefetchedDesigns.current.add(designId)
  }, [])

  const handleSortChange = useCallback((sort: GallerySortOption) => {
    // TODO: Implement sort change logic
    console.log("Sort changed to:", sort)
  }, [])

  return (
    <section className="relative w-full" id="skills">
      {/* Main bordered container */}
      <div className="relative mx-auto flex w-full max-w-full flex-col border-y bg-[radial-gradient(35%_80%_at_50%_0%,--theme(--color-foreground/.08),transparent)] px-4 pt-16 pb-8 overflow-visible">
        {/* Corner PlusIcons */}
        <PlusIcon
          className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6"
          strokeWidth={1}
        />

        {/* Extended side border lines */}
        <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
        <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />

        {/* Content */}
        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <GalleryHeader 
            currentSort="newest" 
            onSortChange={handleSortChange}
          />

          {/* Section Title */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-foreground">Newest</h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-sm text-destructive">Failed to load designs</p>
              <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
            </div>
          )}

          {/* Grid - Linear style 4 columns */}
          {!isLoading && !error && designs && (
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 pb-24 isolate">
              {designs.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-muted-foreground">No designs published yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to publish!</p>
                </div>
              ) : (
                designs.map((design, index) => (
                  <DesignCard 
                    key={design.id} 
                    design={design} 
                    index={index}
                    onVisible={handleDesignVisible}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
