"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0% -80% 0%" }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
    }
  }

  if (items.length === 0) return null

  return (
    <nav className={className}>
      <h5 className="mb-3 text-sm font-semibold">On this page</h5>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                "block text-sm transition-colors",
                item.level === 2 ? "" : "pl-3",
                activeId === item.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Helper function to generate TOC items from page content
export function useTableOfContents() {
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    // Find all h2 and h3 elements in the main content
    const headings = document.querySelectorAll("main h2[id], main h3[id]")
    const tocItems: TOCItem[] = []

    headings.forEach((heading) => {
      const id = heading.id
      const text = heading.textContent || ""
      const level = heading.tagName === "H2" ? 2 : 3

      if (id && text) {
        tocItems.push({ id, text, level })
      }
    })

    setItems(tocItems)
  }, [])

  return items
}
