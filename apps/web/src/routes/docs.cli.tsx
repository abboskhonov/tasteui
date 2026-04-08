import { createFileRoute } from "@tanstack/react-router"
import { DocsCLIPage } from "@/features/docs/pages/cli"

export const Route = createFileRoute("/docs/cli")({
  component: DocsCLIPage,
})
