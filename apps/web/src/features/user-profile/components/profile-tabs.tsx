import { cn } from "@/lib/utils"

export type TabType = "skills" | "bookmarks" | "stars"

interface ProfileTabsProps {
  activeTab: TabType
  skillsCount: number
  bookmarksCount: number
  starsCount: number
  onTabChange: (tab: TabType) => void
}

export function ProfileTabs({
  activeTab,
  skillsCount,
  bookmarksCount,
  starsCount,
  onTabChange
}: ProfileTabsProps) {
  return (
    <div className="inline-flex items-center p-1 bg-muted rounded-lg">
      <TabButton
        active={activeTab === "skills"}
        label="Skills"
        count={skillsCount}
        onClick={() => onTabChange("skills")}
      />
      <TabButton
        active={activeTab === "bookmarks"}
        label="Bookmarks"
        count={bookmarksCount}
        onClick={() => onTabChange("bookmarks")}
      />
      <TabButton
        active={activeTab === "stars"}
        label="Stars"
        count={starsCount}
        onClick={() => onTabChange("stars")}
      />
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  label: string
  count: number
  onClick: () => void
}

function TabButton({ active, label, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 py-1.5 text-sm font-medium transition-all rounded-md",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span>{label}</span>
      <span className="ml-1.5 text-xs text-muted-foreground">
        {count}
      </span>
    </button>
  )
}
