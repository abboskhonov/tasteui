import { createFileRoute } from "@tanstack/react-router"
import { MarketingPage } from "@/features/marketing"
import { getPublicDesignsServerFn } from "@/lib/api/designs-server"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "tasteui - Drop-in design skills for your coding agent",
      },
      {
        name: "description",
        content: "Drop-in design skills for your coding agent. No setup, no configuration — just describe what you need and ship production-ready components in seconds.",
      },
      {
        name: "og:title",
        content: "tasteui - Drop-in design skills for your coding agent",
      },
      {
        name: "og:description",
        content: "Drop-in design skills for your coding agent. No setup, no configuration — just describe what you need and ship production-ready components in seconds.",
      },
      {
        name: "og:type",
        content: "website",
      },
      {
        name: "og:url",
        content: "https://tasteui.dev",
      },
      {
        name: "og:image",
        content: "https://tasteui.dev/og-image.png",
      },
      {
        name: "og:site_name",
        content: "tasteui",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "tasteui - Drop-in design skills for your coding agent",
      },
      {
        name: "twitter:description",
        content: "Drop-in design skills for your coding agent. No setup, no configuration — just describe what you need and ship production-ready components in seconds.",
      },
      {
        name: "twitter:image",
        content: "https://tasteui.dev/og-image.png",
      },
      {
        name: "keywords",
        content: "AI agents, UI design, landing page, design system, token-driven UI, component library",
      },
    ],
  }),
  loader: async () => {
    // Fetch designs on the server - this runs server-side during SSR
    const designs = await getPublicDesignsServerFn()
    return { designs }
  },
  component: App,
})

function App() {
  // Get the server-fetched designs from the route loader
  const { designs } = Route.useLoaderData()
  
  return <MarketingPage initialDesigns={designs} />
}
