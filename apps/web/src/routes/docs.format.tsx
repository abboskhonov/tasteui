import { createFileRoute } from "@tanstack/react-router"
import { DocsFormatPage } from "@/features/docs/pages"

export const Route = createFileRoute("/docs/format")({
  component: DocsFormatPage,
})
