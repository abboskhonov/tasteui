"use client"

import { Outlet } from "@tanstack/react-router"
import { Navigation } from "@/components/navigation/main-navigation"
import { DocsSidebar } from "@/features/docs/sidebar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Match header width exactly */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16 xl:px-20 py-8 pt-6">
        <div className="flex gap-8">
          {/* Left Sidebar - Fixed width - Desktop only */}
          <aside className="w-[200px] shrink-0 hidden md:block">
            <div className="sticky top-24">
              <DocsSidebar />
            </div>
          </aside>

          {/* Main Content - Pages include their own TOC */}
          <main className="flex-1 min-w-0">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden mb-6">
              <Sheet>
                <SheetTrigger render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="h-4 w-4" />
                    <span>Documentation</span>
                  </Button>
                } />
                <SheetContent side="left" className="w-[260px] pt-12">
                  <DocsSidebar />
                </SheetContent>
              </Sheet>
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
