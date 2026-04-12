"use client"

import { useCallback, useEffect, useRef } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { prefetchDesignDetail } from "../queries"
import { prefetchUserProfile } from "@/lib/queries/users"
import { SkillCard } from "@/components/marketing/skill-card"

// Design card data type (subset of Design for gallery display)
export interface DesignCardData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  thumbnailUrl: string | null
  demoUrl: string | null
  viewCount: number
  userId: string
  author?: {
    name: string | null
    username: string | null
    image: string | null
  }
}

export interface DesignCardProps {
  design: DesignCardData
  onVisible?: (designId: string) => void
}

export function DesignCard({ design, onVisible }: DesignCardProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const username = design.author?.username || "unknown"
  const cardRef = useRef<HTMLElement>(null)
  const hasPrefetched = useRef(false)
  
  // Eager prefetch using Intersection Observer - starts loading as soon as card is visible
  useEffect(() => {
    if (!cardRef.current || hasPrefetched.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetched.current) {
            hasPrefetched.current = true
            
            // Notify parent that this card is now visible
            onVisible?.(design.id)
            
            // Prefetch route chunks early
            router.preloadRoute({
              to: "/s/$username/$designSlug",
              params: { username, designSlug: design.slug }
            })
            
            // Prefetch all design data (design + star count)
            prefetchDesignDetail(queryClient, username, design.slug, design.id)
            
            // Disconnect observer since we've prefetched
            observer.disconnect()
          }
        })
      },
      { 
        // Aggressive prefetching: start loading when card is 400px away from viewport
        // This ensures data is ready before user even thinks about clicking
        rootMargin: "400px",
        threshold: 0
      }
    )
    
    observer.observe(cardRef.current)
    
    return () => observer.disconnect()
  }, [design, queryClient, router, username, onVisible])
  
  // Additional prefetch on hover (redundant but catches fast scrollers)
  const handleMouseEnter = useCallback(() => {
    if (hasPrefetched.current) return
    
    router.preloadRoute({
      to: "/s/$username/$designSlug",
      params: { username, designSlug: design.slug }
    })
    
    prefetchDesignDetail(queryClient, username, design.slug, design.id)
  }, [design, queryClient, router, username])
  
  const handleCardClick = useCallback(() => {
    // Store thumbnail/name in sessionStorage for skeleton to access
    // (router state is hard to type properly with TanStack Router)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`skill-preview:${username}/${design.slug}`, JSON.stringify({
        thumbnailUrl: design.thumbnailUrl,
        name: design.name
      }))
    }
    
    // Navigate immediately with view transition for smooth gallery-to-detail morph
    // Only using view transition here where it makes sense - not globally
    navigate({
      to: "/s/$username/$designSlug",
      params: { username, designSlug: design.slug },
      viewTransition: true,
    })
  }, [navigate, username, design.slug, design.thumbnailUrl, design.name])
  
  // Prefetch user profile on hover
  const handleAuthorHover = useCallback(() => {
    prefetchUserProfile(queryClient, username)
  }, [queryClient, username])
  
  const handleAuthorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // Prefetch route before navigation
    router.preloadRoute({
      to: "/u/$username",
      params: { username }
    })
    navigate({
      to: "/u/$username",
      params: { username }
    })
  }, [navigate, router, username])
  
  return (
    <article 
      ref={cardRef}
      className="group relative cursor-pointer z-0 hover:z-50"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Thumbnail Container - moves up on hover */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:shadow-lg group-hover:shadow-foreground/5 group-hover:ring-border group-hover:scale-[1.02]">
        <div className="h-full w-full">
          {design.thumbnailUrl ? (
            <img 
              src={design.thumbnailUrl} 
              alt={design.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <SkillCard variant="pattern" />
          )}
        </div>
      </div>
        
      {/* Metadata - appears below the card on hover with more space */}
      <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between px-1 pt-3 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100">
        <div 
          className="flex items-center gap-3 min-w-0 cursor-pointer"
          onClick={handleAuthorClick}
          onMouseEnter={handleAuthorHover}
        >
          <div className="relative h-6 w-6 shrink-0">
            {design.author?.image ? (
              <img
                src={design.author.image}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-full object-cover ring-1 ring-border/50"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-1 ring-border/50">
                {(design.author?.name || design.name).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-foreground tracking-tight truncate hover:text-primary transition-colors">
            {design.name}
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground/70 tabular-nums shrink-0">
          {design.viewCount.toLocaleString()}
        </span>
      </div>
    </article>
  )
}
