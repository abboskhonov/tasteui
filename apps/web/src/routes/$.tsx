import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeft01Icon,
  CommandLineIcon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons"
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* 404 Label */}
        <p className="text-sm font-medium text-muted-foreground">404</p>

        {/* Main Heading */}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-sm text-base text-muted-foreground leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button className="h-10 w-full gap-2 px-6 sm:w-auto">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                strokeWidth={2}
              />
              Back to home
            </Button>
          </Link>

          <Link to="/">
            <Button
              variant="outline"
              className="h-10 w-full gap-2 px-6 sm:w-auto"
            >
              <HugeiconsIcon
                icon={CommandLineIcon}
                className="size-4"
                strokeWidth={2}
              />
              Design Skills
            </Button>
          </Link>

          <Link to="/docs">
            <Button
              variant="outline"
              className="h-10 w-full gap-2 px-6 sm:w-auto"
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="size-4"
                strokeWidth={2}
              />
              Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
