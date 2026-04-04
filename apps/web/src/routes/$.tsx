import { Link, createFileRoute } from "@tanstack/react-router"
import { Alert01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      {
        title: "404 - Page Not Found | tokenui",
      },
    ],
  }),
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="size-7 text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-medium tracking-tight text-foreground">
            404
          </h1>
          <p className="text-lg text-muted-foreground">
            Page not found
          </p>
        </div>

        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/">
          <Button variant="outline" className="mt-4 gap-2">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  )
}
