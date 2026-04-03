export interface Design {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  category: string
  content: string
  demoUrl: string | null
  thumbnailUrl: string | null
  isPublic: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  author?: {
    name: string | null
    username: string | null
    image: string | null
  }
}

export interface CreateDesignData {
  name: string
  description?: string
  category: string
  content: string
  demoUrl?: string
  thumbnailUrl?: string
  isPublic?: boolean
}

export interface Bookmark {
  id: string
  createdAt: string
  designId: string
  designName: string
  designSlug: string
  designDescription: string | null
  designCategory: string
  designThumbnailUrl: string | null
  designViewCount: number
  designCreatedAt: string
  authorName: string | null
  authorUsername: string | null
  authorImage: string | null
}
