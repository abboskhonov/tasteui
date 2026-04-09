"use client"

import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", to: "/docs" },
  { label: "Installation", to: "/docs/installing" },
  { label: "Publishing", to: "/docs/publishing" },
  { label: "Skill Format", to: "/docs/format" },
  { label: "CLI", to: "/docs/cli" },
  { label: "FAQ", to: "/docs/faq" },
]

export function DocsSidebar() {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1">
      <div className="mb-4 px-3">
        <p className="text-xs font-medium text-muted-foreground">Getting Started</p>
      </div>
      {navItems.slice(0, 2).map((item) => {
        const isActive = pathname === item.to || (item.to !== "/docs" && pathname.startsWith(item.to))
        return (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              "block px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
      
      <div className="mt-6 mb-4 px-3">
        <p className="text-xs font-medium text-muted-foreground">Documentation</p>
      </div>
      {navItems.slice(2).map((item) => {
        const isActive = pathname === item.to || (item.to !== "/docs" && pathname.startsWith(item.to))
        return (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              "block px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
