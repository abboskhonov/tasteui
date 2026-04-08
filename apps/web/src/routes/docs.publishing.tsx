import { createFileRoute } from "@tanstack/react-router"
import { DocsPublishingPage } from "@/features/docs/pages"

export const Route = createFileRoute("/docs/publishing")({
  component: DocsPublishingPage,
})
