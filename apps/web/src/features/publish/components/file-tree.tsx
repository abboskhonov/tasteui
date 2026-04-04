// File node type
export interface FileNode {
  id: string
  name: string
  path: string
  content: string
  type: "file" | "folder"
  isOpen?: boolean
  children?: FileNode[]
}

// Get file content by path
export function getFileContent(files: FileNode[], path: string): string {
  for (const file of files) {
    if (file.path === path && file.type === "file") return file.content
    if (file.children) {
      const found = getFileContent(file.children, path)
      if (found !== "") return found
    }
  }
  return ""
}

// Update file content
export function updateFileContent(files: FileNode[], path: string, content: string): FileNode[] {
  return files.map((file) => {
    if (file.path === path && file.type === "file") {
      return { ...file, content }
    }
    if (file.children) {
      return { ...file, children: updateFileContent(file.children, path, content) }
    }
    return file
  })
}
