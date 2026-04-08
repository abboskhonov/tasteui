import { ChevronRight } from "lucide-react"
import { Link } from "@tanstack/react-router"
import {
  ArrowRight01Icon,
  Clock01Icon,
  Download01Icon,
  FireIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type GallerySortOption = "newest" | "most-downloaded" | "best-rated" | "trending"

export interface GalleryHeaderProps {
  currentSort?: GallerySortOption
  onSortChange?: (sort: GallerySortOption) => void
}

const sortLabels: Record<GallerySortOption, string> = {
  newest: "Newest",
  "most-downloaded": "Most Downloaded",
  "best-rated": "Best Rated",
  trending: "Trending",
}

export function GalleryHeader({ currentSort = "newest", onSortChange }: GalleryHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link 
          to="/" 
          preload="intent"
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Components
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/50" />
        <span className="text-foreground font-medium">All</span>
      </div>
      
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-sm text-muted-foreground hover:text-foreground">
            <span>{sortLabels[currentSort]}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 rotate-90" />
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem 
            className="gap-2 text-sm"
            onClick={() => onSortChange?.("newest")}
          >
            <HugeiconsIcon icon={Clock01Icon} className="size-4" />
            Newest
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 text-sm"
            onClick={() => onSortChange?.("most-downloaded")}
          >
            <HugeiconsIcon icon={Download01Icon} className="size-4" />
            Most Downloaded
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 text-sm"
            onClick={() => onSortChange?.("best-rated")}
          >
            <HugeiconsIcon icon={StarIcon} className="size-4" />
            Best Rated
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 text-sm"
            onClick={() => onSortChange?.("trending")}
          >
            <HugeiconsIcon icon={FireIcon} className="size-4" />
            Trending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
