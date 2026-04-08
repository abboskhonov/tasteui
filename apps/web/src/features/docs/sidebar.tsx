"use client"

import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", to: "/docs" },
  { label: "Platform", to: "/docs/platform" },
  { label: "Installing Skills", to: "/docs/installing" },
  { label: "Publishing Skills", to: "/docs/publishing" },
  { label: "Skill Format", to: "/docs/format" },
  { label: "CLI Reference", to: "/docs/cli" },
  { label: "FAQ", to: "/docs/faq" },
]

export function DocsSidebar() {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.to || (item.to !== "/docs" && pathname.startsWith(item.to))
        return (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              "block px-3 py-2 rounded-lg text-sm",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
