import { createFileRoute } from "@tanstack/react-router"
import { DocsPlatformPage } from "@/features/docs/pages"

export const Route = createFileRoute("/docs/platform")({
  component: DocsPlatformPage,
})
