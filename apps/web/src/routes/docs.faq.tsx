import { createFileRoute } from "@tanstack/react-router"
import { DocsFAQPage } from "@/features/docs/pages/faq"

export const Route = createFileRoute("/docs/faq")({
  component: DocsFAQPage,
})
