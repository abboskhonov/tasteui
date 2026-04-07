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
  
  // Prefetch the demo URL HTML content if available
  if (response.design.demoUrl) {
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
  
  // Hydrate React Query cache with loader data immediately
  useEffect(() => {
    if (loaderData?.design) {
      queryClient.setQueryData(designKeys.detail(username, designSlug), loaderData.design)
    }
  }, [loaderData, queryClient, username, designSlug])
  
  const { data: design, isLoading, error } = useDesign(username, designSlug)
  const trackView = useTrackView()
  
  const [activeTab, setActiveTab] = useState<TabType>("preview")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light")
  
  const {
    user,
    isBookmarkedState,
    isBookmarkPending,
    handleBookmarkClick,
    isStarredState,
    isStarPending,
    handleStarClick,
    isCopied,
    handleCopy,
  } = useDesignActions(design)

  // Track view when page loads
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

  // Copy handlers
  const handleCopyPrompt = useCallback(() => {
    if (design?.content) {
      handleCopy(design.content, "prompt")
    }
  }, [design?.content, handleCopy])

  const handleCopyCode = useCallback((content?: string) => {
    const textToCopy = content || design?.content || ""
    if (textToCopy) {
      handleCopy(textToCopy, "code")
    }
  }, [design?.content, handleCopy])

  const handleCopyInstall = useCallback(() => {
    const command = design ? `npx tokenui.sh add ${design.author?.username || username}/${design.slug}` : ""
    handleCopy(command, "install")
  }, [design, username, handleCopy])

  // Preview handlers
  const togglePreviewTheme = useCallback(() => {
    setPreviewTheme(prev => prev === "light" ? "dark" : "light")
  }, [])

  if (error) {
    return <SkillDetailError />
  }

  if (!design) {
    return <SkillDetailSkeleton username={username} designSlug={designSlug} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkillDetailHeader
        username={username}
        designSlug={designSlug}
      />

      <div className="flex">
        <SkillDetailSidebar
          design={design}
          username={username}
          isCopied={isCopied}
          onCopyPrompt={handleCopyPrompt}
          onCopyCode={handleCopyCode}
          onViewCode={() => setActiveTab(activeTab === "preview" ? "code" : "preview")}
          onCopyInstall={handleCopyInstall}
        />

        <main className="flex-1 h-[calc(100vh-56px)] bg-muted/30 overflow-hidden">
          {activeTab === "preview" ? (
            <PreviewContent
              designName={design.name}
              demoUrl={design.demoUrl}
              previewMode={previewMode}
              previewTheme={previewTheme}
              isStarredState={!!isStarredState}
              isStarPending={isStarPending}
              isBookmarkedState={!!isBookmarkedState}
              isBookmarkPending={isBookmarkPending}
              user={user}
              onSetPreviewMode={setPreviewMode}
              onToggleTheme={togglePreviewTheme}
              onViewCode={() => setActiveTab("code")}
              onStarClick={handleStarClick}
              onBookmarkClick={handleBookmarkClick}
            />
          ) : (
            <CodeView
              design={design}
              isCopied={isCopied === "code"}
              onBackToPreview={() => setActiveTab("preview")}
              onCopyCode={handleCopyCode}
            />
          )}
        </main>
      </div>
    </div>
  )
}
