"use client"

import { useState } from "react"
import { useDesign } from "@/lib/queries/designs"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Copy01Icon, 
  ComputerIcon,
  Cancel01Icon,
  ArrowUpRightIcon,
  File01Icon,
} from "@hugeicons/core-free-icons"
import { useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

interface DesignDetailDialogProps {
  designId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DesignDetailDialog({ designId, open, onOpenChange }: DesignDetailDialogProps) {
  const { data: design, isLoading } = useDesign(designId || "")
  const { data: session } = useSession()
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyPrompt = async () => {
    if (!design?.content) return
    
    try {
      await navigator.clipboard.writeText(design.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px] w-[98vw] h-[90vh] p-0 overflow-hidden bg-background border rounded-xl">
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!design) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] w-[98vw] h-[90vh] p-0 overflow-hidden bg-background border rounded-xl">
        <DialogTitle className="sr-only">{design.name}</DialogTitle>
        
        <div className="flex flex-col h-full">
          {/* Minimal Header */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{design.name}</span>
              {design.category && (
                <span className="text-xs text-muted-foreground">{design.category}</span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Device Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    previewMode === "desktop" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={ComputerIcon} className="size-3.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    previewMode === "mobile" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={ComputerIcon} className="size-3.5 rotate-90" />
                  Mobile
                </button>
              </div>

              {design.demoUrl && (
                <a 
                  href={design.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <HugeiconsIcon icon={ArrowUpRightIcon} className="size-4" />
                </a>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 h-8"
                onClick={handleCopyPrompt}
              >
                <HugeiconsIcon icon={isCopied ? File01Icon : Copy01Icon} className="size-4" />
                {isCopied ? "Copied" : "Copy"}
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </Button>
            </div>
          </div>

          {/* Preview Area - No padding, full bleed */}
          <div className="flex-1 overflow-hidden bg-background">
            {design.demoUrl ? (
              <div 
                className={`h-full mx-auto transition-all duration-300 ${
                  previewMode === "mobile" ? "w-[375px]" : "w-full"
                }`}
              >
                <iframe
                  src={design.demoUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <HugeiconsIcon icon={File01Icon} className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No preview available for this design
                </p>
              </div>
            )}
          </div>

          {/* Minimal Footer */}
          <div className="h-10 border-t border-border px-4 flex items-center justify-between shrink-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{design.viewCount.toLocaleString()} views</span>
              <span>·</span>
              <span>{new Date(design.createdAt).toLocaleDateString()}</span>
            </div>
            <span>by {session?.user?.name || "Unknown"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
