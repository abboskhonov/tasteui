"use client"

import { useMemo } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-markup"

interface HtmlCodeViewProps {
  html: string
}

export function HtmlCodeView({ html }: HtmlCodeViewProps) {
  const highlighted = useMemo(() => {
    return html
      ? Prism.highlight(html, Prism.languages.markup, "html")
      : "// No HTML available"
  }, [html])

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-3 border-b border-border bg-muted/50 flex items-center gap-2 shrink-0">
        <span className="text-xs font-medium text-muted-foreground font-mono truncate">index.html</span>
      </div>
      <div className="flex-1 overflow-auto bg-background">
        <pre className="language-html p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  )
}
