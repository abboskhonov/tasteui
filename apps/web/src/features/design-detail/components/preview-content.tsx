import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import { PreviewToolbar } from "./preview-toolbar"
import type { SessionUser } from "@/lib/api/auth-server"

interface PreviewContentProps {
  designName: string
  demoUrl: string | null
  previewMode: "desktop" | "mobile"
  previewTheme: "light" | "dark"
  isStarredState: boolean
  isStarPending: boolean
  isBookmarkedState: boolean
  isBookmarkPending: boolean
  user: SessionUser | null
  onSetPreviewMode: (mode: "desktop" | "mobile") => void
  onToggleTheme: () => void
  onViewCode: () => void
  onStarClick: () => void
  onBookmarkClick: () => void
}

export function PreviewContent({
  designName,
  demoUrl,
  previewMode,
  previewTheme,
  isStarredState,
  isStarPending,
  isBookmarkedState,
  isBookmarkPending,
  user,
  onSetPreviewMode,
  onToggleTheme,
  onViewCode,
  onStarClick,
  onBookmarkClick,
}: PreviewContentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Prefetch the demo URL as soon as component mounts
  useEffect(() => {
    if (demoUrl) {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = demoUrl
      link.as = "document"
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [demoUrl])

  return (
    <div className="h-full p-4">
      {/* Rounded container with toolbar and preview */}
      <div className={cn(
        "h-full rounded-xl overflow-hidden flex flex-col ring-1 ring-border",
        previewTheme === "dark" ? "bg-[#0d1117]" : "bg-white"
      )}>
        {/* Toolbar inside the container */}
        <div className="border-b border-border/50">
          <PreviewToolbar
            previewMode={previewMode}
            previewTheme={previewTheme}
            isStarredState={isStarredState}
            isStarPending={isStarPending}
            isBookmarkedState={isBookmarkedState}
            isBookmarkPending={isBookmarkPending}
            user={user}
            onSetPreviewMode={onSetPreviewMode}
            onToggleTheme={onToggleTheme}
            onViewCode={onViewCode}
            onStarClick={onStarClick}
            onBookmarkClick={onBookmarkClick}
          />
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className={cn(
              "w-full h-full transition-all duration-300",
              previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"
            )}
          >
            {demoUrl ? (
              <div className="w-full h-full relative">
                {/* Loading skeleton */}
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-xs text-muted-foreground">Loading preview...</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={demoUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title={`${designName} preview`}
                  onLoad={() => setIsLoading(false)}
                  loading="eager"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <HugeiconsIcon icon={File01Icon} className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No preview available for this skill
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}