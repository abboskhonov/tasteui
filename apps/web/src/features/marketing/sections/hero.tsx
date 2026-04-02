"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"

export function Hero() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx tasteui add <design>")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <section className="relative w-full">
      {/* Main bordered container with gradient */}
      <div className="relative mx-auto flex w-full max-w-full flex-col items-center justify-center border-y bg-[radial-gradient(35%_80%_at_50%_0%,--theme(--color-foreground/.08),transparent)] px-4 py-20 md:py-28">
        {/* Corner PlusIcons */}
        <PlusIcon
          className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6"
          strokeWidth={1}
        />

        {/* Extended side border lines */}
        <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l" />
        <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r" />

        {/* Dashed center line */}
        <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-light tracking-tight text-foreground mb-4">
            TasteUI
          </h1>

          {/* Tagline */}
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Design components for AI agents
          </p>

          {/* Divider */}
          <div className="w-16 h-px bg-border mb-8" />

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-md mb-12 leading-relaxed">
            Install beautiful UI with one command. Built for developers who ship fast.
          </p>

          {/* CLI */}
          <button
            onClick={handleCopy}
            className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-muted/50 border border-border/50 font-mono text-sm hover:bg-muted transition-colors"
          >
            <span className="text-muted-foreground">$</span>
            <span className="text-foreground">npx tasteui add &lt;design&gt;</span>
            <span className="w-px h-4 bg-border mx-2" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
