"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import type { Design } from "@/lib/types/design"
import { SkillCard } from "@/components/marketing/skill-card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Bookmark01Icon,
  Copy01Icon,
  Tick02Icon,
  Download02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import {
  useBookmarkCheck,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/lib/queries/designs"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"

interface DesignCardProps {
  design: Design
  priority?: boolean
  index?: number
}

export const DesignCard = memo(function DesignCard({
  design,
  priority = false,
  index = 0,
}: DesignCardProps) {
  const username = design.author?.username || "unknown"
  const { user } = useUser()
  const { data: isBookmarked } = useBookmarkCheck(design.id, false, !!user)

  const isHighPriority = priority || index < 4
  const createBookmark = useCreateBookmark()
  const deleteBookmark = useDeleteBookmark()

  const isBookmarkedState =
    isBookmarked || createBookmark.variables === design.id
  const isPending = createBookmark.isPending || deleteBookmark.isPending

  const handleBookmarkClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        toast.error("Please sign in to save skills")
        return
      }

      if (isPending) return

      if (isBookmarked) {
        deleteBookmark.mutate(design.id, {
          onSuccess: () => toast.success("Removed from saved"),
          onError: () => toast.error("Failed to remove"),
        })
      } else {
        createBookmark.mutate(design.id, {
          onSuccess: () => toast.success("Saved to your collection"),
          onError: () => toast.error("Failed to save"),
        })
      }
    },
    [isBookmarked, isPending, design.id, deleteBookmark, createBookmark, user]
  )

  const [isCopied, setIsCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleCopyClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const command = `npx tasteui.dev add ${username}/${design.slug}`
      navigator.clipboard.writeText(command).then(() => {
        setIsCopied(true)
        toast.success("Command copied to clipboard")
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000)
      })
    },
    [username, design.slug]
  )

  return (
    <Link
      to="/s/$username/$designSlug"
      params={{ username, designSlug: design.slug }}
    >
      <article className="group cursor-pointer">
        {/* Wrapper — dark padded frame like superdesign.dev */}
        <div
          className={cn(
            "relative p-2 md:p-2.5 rounded-2xl bg-card",
            "ring-1 ring-border/30",
            "transition-[shadow,ring-color] duration-300 ease-out",
            "group-hover:shadow-2xl group-hover:shadow-foreground/5 group-hover:ring-border/40"
          )}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            {design.thumbnailUrl ? (
              <img
                src={design.thumbnailUrl}
                alt={design.name}
                width={400}
                height={225}
                className="h-full w-full object-cover"
                loading={isHighPriority ? "eager" : "lazy"}
                decoding={isHighPriority ? "sync" : "async"}
                fetchPriority={isHighPriority ? "high" : "low"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <SkillCard variant="pattern" />
            )}

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Description on hover */}
            {design.description && (
              <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                <p className="text-xs text-white/90 line-clamp-2 drop-shadow-sm">
                  {design.description}
                </p>
              </div>
            )}

            {/* Action buttons on hover */}
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              <button
                onClick={handleCopyClick}
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5",
                  "bg-black/50 backdrop-blur-sm",
                  "transition-colors duration-200",
                  isCopied
                    ? "text-green-400"
                    : "text-white/80 hover:text-white hover:bg-black/70"
                )}
                aria-label={isCopied ? "Copied!" : "Copy install command"}
              >
                <HugeiconsIcon
                  icon={isCopied ? Tick02Icon : Copy01Icon}
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isCopied && "scale-110"
                  )}
                />
              </button>
              {user && (
                <button
                  onClick={handleBookmarkClick}
                  disabled={isPending}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-1.5",
                    "bg-black/50 backdrop-blur-sm",
                    "transition-colors duration-200",
                    isBookmarkedState
                      ? "text-white"
                      : "text-white/80 hover:text-white hover:bg-black/70",
                    isPending && "opacity-50"
                  )}
                  aria-label={
                    isBookmarkedState ? "Remove bookmark" : "Add bookmark"
                  }
                >
                  <HugeiconsIcon
                    icon={Bookmark01Icon}
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isBookmarkedState && "fill-current scale-110"
                    )}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name + stats row */}
        <div className="mt-2.5 flex items-center justify-between gap-3 px-1">
          <h2 className="min-w-0 flex-1 text-sm font-medium text-foreground truncate leading-tight">
            {design.name}
          </h2>
          <div className="flex items-center gap-3 text-muted-foreground shrink-0">
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={ViewIcon} className="size-3.5" />
              <span className="text-xs font-medium tabular-nums">
                {(design.viewCount ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Download02Icon} className="size-3.5" />
              <span className="text-xs font-medium tabular-nums">
                {(design.installCount ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
})
