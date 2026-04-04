"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Add01Icon,
  Folder01Icon,
  File01Icon,
  Delete01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { FileNode } from "./file-tree"

interface FileTreeProps {
  files: FileNode[]
  activePath: string
  onSelect: (path: string) => void
  onFilesChange: (files: FileNode[]) => void
}

interface FileTreeItemProps {
  node: FileNode
  depth: number
  activePath: string
  onSelect: (path: string) => void
  onToggle: (path: string) => void
  onDelete: (path: string) => void
}

function FileTreeItem({ node, depth, activePath, onSelect, onToggle, onDelete }: FileTreeItemProps) {
  const isActive = node.path === activePath

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 cursor-pointer group",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => node.type === "file" ? onSelect(node.path) : onToggle(node.path)}
      >
        {node.type === "folder" && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className={cn("size-3.5 transition-transform", node.isOpen && "rotate-90")}
          />
        )}
        <HugeiconsIcon
          icon={node.type === "folder" ? Folder01Icon : File01Icon}
          className={cn("size-4", node.type === "folder" && "text-blue-500")}
        />
        <span className="flex-1 text-sm truncate">{node.name}</span>
        {node.type === "file" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.path)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-3.5 text-destructive" />
          </button>
        )}
      </div>
      {node.type === "folder" && node.isOpen && node.children?.map((child) => (
        <FileTreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          activePath={activePath}
          onSelect={onSelect}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export function FileTree({ files, activePath, onSelect, onFilesChange }: FileTreeProps) {
  const [newFileName, setNewFileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const updateNode = (nodes: FileNode[], path: string, updater: (n: FileNode) => FileNode): FileNode[] => {
    return nodes.map((n) => {
      if (n.path === path) return updater(n)
      if (n.children) return { ...n, children: updateNode(n.children, path, updater) }
      return n
    })
  }

  const deleteNode = (nodes: FileNode[], path: string): FileNode[] => {
    return nodes
      .filter((n) => n.path !== path)
      .map((n) => (n.children ? { ...n, children: deleteNode(n.children, path) } : n))
  }

  const handleToggle = (path: string) => {
    onFilesChange(updateNode(files, path, (n) => ({ ...n, isOpen: !n.isOpen })))
  }

  const handleDelete = (path: string) => {
    onFilesChange(deleteNode(files, path))
    if (activePath === path && files.length > 0) {
      const firstFile = files.find(f => f.type === "file")
      if (firstFile) onSelect(firstFile.path)
    }
  }

  const handleCreateFile = () => {
    if (!newFileName) return
    const newFile: FileNode = {
      id: crypto.randomUUID(),
      name: newFileName,
      path: newFileName,
      content: "",
      type: "file",
    }
    onFilesChange([...files, newFile])
    onSelect(newFileName)
    setNewFileName("")
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreating(true)}>
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {files.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            activePath={activePath}
            onSelect={onSelect}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
        {isCreating && (
          <div className="px-2 py-1">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleCreateFile}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              placeholder="filename.tsx"
              className="h-7 text-sm"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  )
}
