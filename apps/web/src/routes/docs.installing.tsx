import { createFileRoute } from "@tanstack/react-router"
import { DocsInstallingPage } from "@/features/docs/pages"

export const Route = createFileRoute("/docs/installing")({
  component: DocsInstallingPage,
})
