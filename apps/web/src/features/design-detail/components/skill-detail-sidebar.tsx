import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Copy01Icon, 
  File01Icon, 
  CodeIcon, 
  Tick02Icon,
  EyeIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Design } from "@/lib/types/design"

interface SkillDetailSidebarProps {
  design: Design
  username: string
  isCopied: string | null
  onCopyPrompt: () => void
  onCopyCode: () => void
  onViewCode: () => void
  onCopyInstall: () => void
}

export function SkillDetailSidebar({
  design,
  username,
  isCopied,
  onCopyPrompt,
  onCopyCode,
  onViewCode,
  onCopyInstall,
}: SkillDetailSidebarProps) {
  const installationCommand = `npx tokenui.sh add ${design.author?.username || username}/${design.slug}`
  
  return (
    <aside className="w-[340px] h-[calc(100vh-56px)] border-r border-border bg-card/30 hidden lg:block overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {design.name}
          </h1>
          {design.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {design.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={EyeIcon} className="size-4" />
            <span>{design.viewCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HugeiconsIcon icon={Download01Icon} className="size-4" />
            <span>CLI</span>
          </div>
        </div>

        {/* Created by */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Created by</p>
          <Link 
            to="/u/$username" 
            params={{ username }} 
            className="flex items-center gap-3 group cursor-pointer"
          >
            {design.author?.image ? (
              <img
                src={design.author.image}
                alt={design.author.name || "Author"}
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/50 transition-all"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-primary-foreground font-medium">
                {(design.author?.name || design.name).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium group-hover:text-primary transition-colors">
                {design.author?.name || username}
              </p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </Link>
        </div>

        {/* Installation */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Installation</p>
          <div 
            className="group relative rounded-lg bg-muted px-3 py-2.5 font-mono text-xs cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={onCopyInstall}
          >
            <span className="text-muted-foreground">$</span>{" "}
            <span className="text-foreground">{installationCommand}</span>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <HugeiconsIcon 
                icon={isCopied === "install" ? Tick02Icon : Copy01Icon} 
                className={cn("size-3.5", isCopied === "install" && "text-green-500")}
              />
            </div>
          </div>
        </div>

        {/* How to use */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">How to use</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 text-xs gap-1.5"
              onClick={onCopyPrompt}
            >
              <HugeiconsIcon icon={isCopied === "prompt" ? Tick02Icon : Copy01Icon} className="size-3.5" />
              Copy prompt
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 text-xs gap-1.5"
              onClick={onCopyCode}
            >
              <HugeiconsIcon icon={isCopied === "code" ? Tick02Icon : File01Icon} className="size-3.5" />
              Copy code
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs gap-1.5 w-full"
              onClick={onViewCode}
            >
              <HugeiconsIcon icon={CodeIcon} className="size-3.5" />
              View code
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}