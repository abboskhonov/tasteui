import { createFileRoute } from "@tanstack/react-router"
import { MarketingPage } from "@/features/marketing"
import { getPublicDesignsServerFn } from "@/lib/api/designs-server"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "tasteui - Design layer for AI agents",
      },
      {
        name: "description",
        content:
          "tasteui is a design layer for AI agents, with reusable landing page skills, token-driven UI, and dev-focused workflow building blocks.",
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
