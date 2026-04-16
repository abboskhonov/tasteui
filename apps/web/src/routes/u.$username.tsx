import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import type { TabType } from "@/features/user-profile/components"
import {
  BookmarkCard,
  DesignsGrid,
  ProfileError,
  ProfileHeader,
  ProfileInfo,
  ProfileNotFound,
  ProfileSkeleton,
  ProfileTabs,
  SearchInput,
  StarCard,
} from "@/features/user-profile/components"
import { useProfileSearch } from "@/features/user-profile/hooks"
import type { Bookmark, Star } from "@/lib/types/design"
import { api } from "@/lib/api/client"
import { useUserProfile, type UserProfileResponse } from "@/lib/queries/users"
import { useBookmarks, useStars } from "@/lib/queries/designs"

export const Route = createFileRoute("/u/$username")({
  component: UserProfilePage,
  loader: async ({ params }) => {
    // Fetch user profile data server-side for SEO
    const response = await api.get<UserProfileResponse>(`/api/users/${params.username}`)
    return { profile: response }
  },
  head: ({ loaderData, params }) => {
    const user = loaderData?.profile?.user
    const stats = loaderData?.profile?.stats
    
    // Build title
    const displayName = user?.name || params.username
    const title = `${displayName} (${params.username}) - tasteui`
    
    // Build description from bio or fallback
    let description = user?.bio
    if (!description && stats) {
      const skills = stats.components || 0
      description = `View ${skills} design ${skills === 1 ? 'skill' : 'skills'} by ${displayName} on tasteui. Browse and install reusable design skills for your projects.`
    } else if (!description) {
      description = `View design skills by ${displayName} on tasteui. Browse and install reusable landing page skills, token-driven UI, and dev-focused building blocks.`
    }
    
    // Get profile image for OG
    const ogImage = user?.image || "https://tasteui.dev/og-image.png"
    const canonicalUrl = `https://tasteui.dev/u/${params.username}`
    
    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          name: "og:title",
          content: title,
        },
        {
          name: "og:description",
          content: description,
        },
        {
          name: "og:type",
          content: "profile",
        },
        {
          name: "og:url",
          content: canonicalUrl,
        },
        {
          name: "og:image",
          content: ogImage,
        },
        {
          name: "og:site_name",
          content: "tasteui",
        },
        {
          name: "profile:username",
          content: params.username,
        },
        {
          name: "profile:first_name",
          content: user?.name?.split(' ')[0] || '',
        },
        {
          name: "profile:last_name",
          content: user?.name?.split(' ').slice(1).join(' ') || '',
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
        {
          name: "twitter:image",
          content: ogImage,
        },
        {
          name: "canonical",
          content: canonicalUrl,
        },
        {
          name: "robots",
          content: "index, follow",
        },
      ],
    }
  },
  // No blocking loader - navigate immediately and show skeleton
  errorComponent: () => <ProfileError />,
  notFoundComponent: () => <ProfileNotFound />,
})

function UserProfilePage() {
  const { username } = Route.useParams()
  const { profile: loaderProfileData } = Route.useLoaderData()
  const { data: fetchedProfileData, isLoading, error } = useUserProfile(username)
  const { data: bookmarks = [] } = useBookmarks()
  const { data: stars = [] } = useStars()
  const [activeTab, setActiveTab] = useState<TabType>("skills")
  
  // Use loader data immediately for instant rendering, then hydrate with fresh data
  const profileData = fetchedProfileData || loaderProfileData
  
  // Search only applies to skills tab
  const { searchQuery, setSearchQuery, filteredDesigns } = useProfileSearch(
    profileData?.designs || []
  )

  // Show skeleton while loading - data is prefetched so this is brief
  if (isLoading && !profileData) {
    return <ProfileSkeleton username={username} />
  }

  if (error || !profileData) {
    return <ProfileError />
  }

  const { user, stats } = profileData

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileHeader username={username} />

      <main className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16 xl:px-20 py-4">
        <ProfileInfo user={user} username={username} stats={stats} />

        {/* Tabs & Search */}
        <div className="flex items-center justify-between mb-6">
          <ProfileTabs
            activeTab={activeTab}
            skillsCount={stats.components}
            bookmarksCount={bookmarks.length}
            starsCount={stars.length}
            onTabChange={setActiveTab}
          />
          {activeTab === "skills" && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search skills..."
            />
          )}
        </div>

        {/* Content */}
        {activeTab === "skills" && (
          <DesignsGrid designs={filteredDesigns} username={username} />
        )}
        
        {activeTab === "bookmarks" && (
          <BookmarksGrid bookmarks={bookmarks} />
        )}
        
        {activeTab === "stars" && (
          <StarsGrid stars={stars} />
        )}
      </main>
    </div>
  )
}

function BookmarksGrid({ bookmarks }: { bookmarks: Array<Bookmark> }) {
  if (bookmarks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No bookmarks yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-12">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}

function StarsGrid({ stars }: { stars: Array<Star> }) {
  if (stars.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No starred designs yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-12">
      {stars.map((star) => (
        <StarCard key={star.id} star={star} />
      ))}
    </div>
  )
}
