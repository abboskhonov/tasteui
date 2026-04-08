import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useDesign, useTrackView, designKeys } from "@/lib/queries/designs"
import { useState, useCallback, useEffect } from "react"
import { useDesignActions } from "@/features/design-detail/hooks"
import {
  SkillDetailHeader,
  SkillDetailSidebar,
  PreviewContent,
  CodeView,
  SkillDetailSkeleton,
  SkillDetailError,
  SkillNotFound,
} from "@/features/design-detail/components"
import type { Design } from "@/lib/types/design"
import { api } from "@/lib/api/client"

// Loader function to prefetch design data during route resolution
async function designLoader({ params }: { params: { username: string; designSlug: string } }) {
  const { username, designSlug } = params
  
  // Fetch the design data immediately
  const response = await api.get<{ design: Design }>(`/api/designs/${username}/${designSlug}`)
  
  // Prefetch the demo URL HTML content if available (browser only)
  if (typeof window !== "undefined" && response.design.demoUrl) {
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.href = response.design.demoUrl
    link.as = "document"
    document.head.appendChild(link)
  }
  
  return {
    design: response.design,
    username,
    designSlug,
  }
}

export const Route = createFileRoute("/s/$username/$designSlug")({
  component: SkillDetailPage,
  loader: designLoader,
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.designSlug} by ${params.username} - tokenui`,
      },
    ],
  }),
  errorComponent: () => <SkillDetailError />,
  notFoundComponent: () => <SkillNotFound />,
})

type TabType = "preview" | "code"

function SkillDetailPage() {
  const { username, designSlug } = Route.useParams()
  const loaderData = Route.useLoaderData()
  const queryClient = useQueryClient()
  
  // Get cached data immediately for instant UI (if prefetched from gallery)
  const cachedDesign = queryClient.getQueryData<Design>(designKeys.detail(username, designSlug))
  
  // Hydrate React Query cache with loader data immediately
  useEffect(() => {
    if (loaderData?.design) {
      queryClient.setQueryData(designKeys.detail(username, designSlug), loaderData.design)
    }
  }, [loaderData, queryClient, username, designSlug])
  
  const { data: design, isLoading, error } = useDesign(username, designSlug)
  
  // Use cached/prefetched data immediately while loading for perceived instant navigation
  const displayDesign = design || cachedDesign
  const trackView = useTrackView()
  
  const [activeTab, setActiveTab] = useState<TabType>("preview")
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light")
  
  // Only use design actions when design is loaded (use displayDesign for instant UI)
  const designActions = useDesignActions(displayDesign)
  
  const { user, isBookmarkedState, handleBookmarkClick, isStarredState, handleStarClick, isCopied, handleCopy } = designActions

  // Track view when page loads (only track when we have real loaded data, not cached)
  useEffect(() => {
    if (design?.id && !isLoading) {
      trackView.mutate(design.id, {
        onSuccess: (data) => {
          if (data.isNewView) {
            queryClient.invalidateQueries({ queryKey: designKeys.my() })
            queryClient.invalidateQueries({ queryKey: designKeys.detail(username, designSlug) })
          }
        },
        onError: (error) => {
          console.error("Failed to track view:", error)
        }
      })
    }
  }, [design?.id, isLoading, username, designSlug])

  const handleCopyInstall = useCallback(() => {
    const command = displayDesign ? `npx tokenui.sh add ${displayDesign.author?.username || username}/${displayDesign.slug}` : ""
    handleCopy(command, "install")
  }, [displayDesign, username, handleCopy])

  // Preview handlers
  const togglePreviewTheme = useCallback(() => {
    setPreviewTheme(prev => prev === "light" ? "dark" : "light")
  }, [])

  if (error) {
    console.error("Route error:", error)
    return <SkillDetailError />
  }

  // Show skeleton only if we have no cached data AND we're loading
  if (!displayDesign) {
    return <SkillDetailSkeleton username={username} designSlug={designSlug} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkillDetailHeader
        username={username}
        designSlug={designSlug}
        previewTheme={previewTheme}
        isShowingFiles={activeTab === "code"}
        onToggleFiles={() => setActiveTab(activeTab === "preview" ? "code" : "preview")}
        onToggleTheme={togglePreviewTheme}
      />

      <div className="flex">
        <SkillDetailSidebar
          design={displayDesign}
          username={username}
          user={user}
          isCopied={isCopied}
          isStarredState={!!isStarredState}
          isBookmarkedState={!!isBookmarkedState}
          onCopyInstall={handleCopyInstall}
          onStarClick={handleStarClick}
          onBookmarkClick={handleBookmarkClick}
        />

        <main className="flex-1 h-[calc(100vh-56px)] overflow-hidden">
          {activeTab === "preview" ? (
            <PreviewContent
              design={displayDesign}
              demoUrl={displayDesign.demoUrl}
              previewTheme={previewTheme}
            />
          ) : (
            <CodeView design={displayDesign} />
          )}
        </main>
      </div>
    </div>
  )
}
