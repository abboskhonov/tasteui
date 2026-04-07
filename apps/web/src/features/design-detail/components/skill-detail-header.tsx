import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Menu01Icon,
  Copy01Icon,
  File01Icon,
  CodeIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SkillDetailHeaderProps {
  username: string
  designSlug: string
  isCopied: string | null
  onCopyPrompt: () => void
  onCopyCode: () => void
  onViewCode: () => void
}

export function SkillDetailHeader({
  username,
  designSlug,
  isCopied,
  onCopyPrompt,
  onCopyCode,
  onViewCode,
}: SkillDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto h-full max-w-full px-4 flex items-center justify-between">
        {/* Left: Menu button */}
        <Button variant="ghost" size="icon-sm" className="h-8 w-8 -ml-1">
          <HugeiconsIcon icon={Menu01Icon} className="size-4" />
        </Button>

        {/* Center: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm absolute left-1/2 -translate-x-1/2">
          <Link 
            to="/u/$username"
            params={{ username }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {username}
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium truncate max-w-[200px]">{designSlug}</span>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs gap-1.5 px-2.5"
            onClick={onCopyPrompt}
          >
            <HugeiconsIcon 
              icon={isCopied === "prompt" ? Tick02Icon : Copy01Icon} 
              className={cn("size-3.5", isCopied === "prompt" && "text-green-500")} 
            />
            Copy prompt
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs gap-1.5 px-2.5"
            onClick={onCopyCode}
          >
            <HugeiconsIcon 
              icon={isCopied === "code" ? Tick02Icon : File01Icon} 
              className={cn("size-3.5", isCopied === "code" && "text-green-500")} 
            />
            Copy code
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs gap-1.5 px-2.5"
            onClick={onViewCode}
          >
            <HugeiconsIcon icon={CodeIcon} className="size-3.5" />
            View code
          </Button>
        </div>
      </div>
    </header>
  )
}
