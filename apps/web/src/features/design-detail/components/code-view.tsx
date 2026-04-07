"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeftIcon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { Design } from "@/lib/types/design"
import type { FileNode } from "@/features/publish/components/file-tree"
import { FileTree } from "./file-tree-readonly"

interface CodeViewProps {
  design: Design
  isCopied: boolean
  onBackToPreview: () => void
  onCopyCode: (content?: string) => void
}

export function CodeView({
  design,
  isCopied,
  onBackToPreview,
  onCopyCode,
}: CodeViewProps) {
  // Build file tree from design
  const files = useMemo(() => {
    if (design.files && design.files.length > 0) {
      return design.files
    }
    // Single file fallback - create a simple tree with just SKILL.md
    return [
      {
        id: "skill-md",
        name: "SKILL.md",
        path: "SKILL.md",
        content: design.content,
        type: "file" as const,
      },
    ]
  }, [design.files, design.content])

  // Set default active file to SKILL.md or first file
  const [activePath, setActivePath] = useState(() => {
    const allPaths = getAllFilePaths(files)
    const skillMdPath = allPaths.find((p) => p.endsWith("SKILL.md"))
    return skillMdPath || allPaths[0] || "SKILL.md"
  })

  // Get content of active file
  const activeContent = useMemo(() => {
    return findFileContent(files, activePath) || ""
  }, [files, activePath])

  const handleCopy = () => {
    onCopyCode(activeContent)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-background/50">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 h-8 text-xs"
            onClick={onBackToPreview}
          >
            <HugeiconsIcon icon={ArrowLeftIcon} className="size-3.5" />
            Back to preview
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-8 text-xs"
          onClick={handleCopy}
        >
          <HugeiconsIcon 
            icon={isCopied ? Tick02Icon : Copy01Icon} 
            className={cn("size-3.5", isCopied && "text-green-500")}
          />
          {isCopied ? "Copied!" : "Copy code"}
        </Button>
      </div>

      {/* Content - File Tree + Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30">
          <FileTree 
            files={files} 
            activePath={activePath} 
            onSelect={setActivePath}
          />
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto bg-[#0d1117]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-mono">{activePath}</span>
            </div>
            <pre className="text-sm font-mono text-white/90 whitespace-pre-wrap">
              {activeContent || "// No code available"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to get all file paths
function getAllFilePaths(files: FileNode[]): string[] {
  const paths: string[] = []
  
  function traverse(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.type === "file") {
        paths.push(node.path)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(files)
  return paths
}

// Helper to find file content by path
function findFileContent(files: FileNode[], path: string): string | null {
  for (const node of files) {
    if (node.path === path && node.type === "file") {
      return node.content
    }
    if (node.children) {
      const found = findFileContent(node.children, path)
      if (found) return found
    }
  }
  return null
}