// File node type
export interface FileNode {
  id: string
  name: string
  path: string
  content: string
  type: "file" | "folder"
  isOpen?: boolean
  children?: Array<FileNode>
}

// Get file content by path
export function getFileContent(files: Array<FileNode>, path: string): string {
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
export function updateFileContent(files: Array<FileNode>, path: string, content: string): Array<FileNode> {
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

// Add a file to a specific folder
export function addFileToFolder(
  files: Array<FileNode>,
  folderPath: string | null,
  newFile: FileNode
): Array<FileNode> {
  if (!folderPath) {
    // Add to root
    return [...files, newFile]
  }

  return files.map((file) => {
    if (file.path === folderPath && file.type === "folder") {
      return {
        ...file,
        children: [...(file.children || []), newFile],
        isOpen: true,
      }
    }
    if (file.children) {
      return { ...file, children: addFileToFolder(file.children, folderPath, newFile) }
    }
    return file
  })
}

// Add a folder to a specific folder (null for root)
export function addFolderToFolder(
  files: Array<FileNode>,
  folderPath: string | null,
  newFolder: FileNode
): Array<FileNode> {
  if (!folderPath) {
    // Add to root
    return [...files, newFolder]
  }

  return files.map((file) => {
    if (file.path === folderPath && file.type === "folder") {
      return {
        ...file,
        children: [...(file.children || []), newFolder],
        isOpen: true,
      }
    }
    if (file.children) {
      return { ...file, children: addFolderToFolder(file.children, folderPath, newFolder) }
    }
    return file
  })
}

// Update node (toggle open, etc)
export function updateNode(
  files: Array<FileNode>,
  path: string,
  updater: (node: FileNode) => FileNode
): Array<FileNode> {
  return files.map((node) => {
    if (node.path === path) return updater(node)
    if (node.children) {
      return { ...node, children: updateNode(node.children, path, updater) }
    }
    return node
  })
}

// Delete node by path
export function deleteNode(files: Array<FileNode>, path: string): Array<FileNode> {
  return files
    .filter((n) => n.path !== path)
    .map((n) => (n.children ? { ...n, children: deleteNode(n.children, path) } : n))
}

// Get all file paths (for validation)
export function getAllFilePaths(files: Array<FileNode>): Array<string> {
  const paths: Array<string> = []
  for (const file of files) {
    paths.push(file.path)
    if (file.children) {
      paths.push(...getAllFilePaths(file.children))
    }
  }
  return paths
}

// Check if a path exists
export function pathExists(files: Array<FileNode>, path: string): boolean {
  return getAllFilePaths(files).includes(path)
}
