"use client"

import type { ReactNode } from "react"
import { Breadcrumb, PageHeader } from "../components"
import { TableOfContents } from "./table-of-contents"
import type { TOCItem } from "./table-of-contents"

interface DocsPageProps {
  title: string
  description?: string
  breadcrumbItems: { label: string; href?: string }[]
  tocItems: TOCItem[]
  children: ReactNode
}

export function DocsPage({ 
  title, 
  description, 
  breadcrumbItems, 
  tocItems,
  children 
}: DocsPageProps) {
  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title={title} description={description} />
        {children}
      </div>

      {/* Right Sidebar - Table of Contents */}
      <aside className="w-[200px] shrink-0 hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents items={tocItems} />
        </div>
      </aside>
    </div>
  )
}
