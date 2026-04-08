export { MarketingPage } from "./page"

// APIs
export {
  getPublicDesigns,
  getTrendingDesigns,
  getTopRatedDesigns,
  getNewestDesigns,
  getDesignBySlug,
  getStarCount,
} from "./apis"

// Queries & Hooks
export {
  marketingKeys,
  useMarketingDesigns,
  useTrendingDesigns,
  useTopRatedDesigns,
  useNewestDesigns,
  prefetchDesignDetail,
  batchPrefetchDesigns,
} from "./queries"

// Components
export {
  DesignCard,
  GalleryHeader,
  type DesignCardData,
  type DesignCardProps,
  type GallerySortOption,
  type GalleryHeaderProps,
} from "./components"

// Sections
export { SkillsGallery } from "./sections/skills-gallery"
export { Header } from "./sections/header"
export { Footer } from "./sections/footer"
