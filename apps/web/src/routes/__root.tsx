import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"

import appCss from "../styles.css?url"

import { QueryProvider } from "@/lib/query-provider"
import { UserProvider } from "@/lib/user-context"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/router"
import { useSession } from "@/lib/queries/auth"
import { Suspense, lazy, useMemo } from "react"

// Schema.org structured data for SEO
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tasteui.dev/#organization",
      name: "TasteUI",
      url: "https://tasteui.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://tasteui.dev/logo512.png",
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/tasteui",
        "https://github.com/tasteui",
      ],
      description:
        "Drop-in design skills for your coding agent. Share and discover custom shadcn/ui components.",
    },
    {
      "@type": "WebSite",
      "@id": "https://tasteui.dev/#website",
      url: "https://tasteui.dev",
      name: "TasteUI",
      publisher: {
        "@id": "https://tasteui.dev/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://tasteui.dev/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "TasteUI",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "CLI tool and platform for sharing drop-in design skills for AI coding agents",
      url: "https://tasteui.dev",
      author: {
        "@id": "https://tasteui.dev/#organization",
      },
    },
  ],
}

// Lazy load devtools only in development
const TanStackRouterDevtoolsPanel = import.meta.env.DEV 
  ? lazy(() => import("@tanstack/react-router-devtools").then(m => ({ default: m.TanStackRouterDevtoolsPanel })))
  : () => null
const TanStackDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-devtools").then(m => ({ default: m.TanStackDevtools })))
  : () => null

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "tasteui - Drop-in design skills for your coding agent",
      },
      {
        name: "description",
        content: "Drop-in design skills for your coding agent. No setup, no configuration — just describe what you need and ship production-ready components in seconds.",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        name: "color-scheme",
        content: "dark light",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "author",
        content: "tasteui",
      },
      {
        name: "og:type",
        content: "website",
      },
      {
        name: "og:site_name",
        content: "tasteui",
      },
      {
        name: "og:locale",
        content: "en_US",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@tasteui",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Preconnect to critical domains - establishes early connection
      {
        rel: "preconnect",
        href: "https://api.tasteui.dev",
      },
      // R2 public URL - critical for image loading performance
      {
        rel: "preconnect",
        href: "https://pub-760132b719d849e3aea8daf679b700b7.r2.dev",
        crossOrigin: "anonymous",
      },
      // DNS prefetch for faster resolution
      {
        rel: "dns-prefetch",
        href: "https://api.tasteui.dev",
      },
      {
        rel: "dns-prefetch",
        href: "https://static.cloudflareinsights.com",
      },
      {
        rel: "canonical",
        href: "https://tasteui.dev",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  // No blocking server-side loaders - fetch user client-side for faster TTFB
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryProvider queryClient={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <RootDocument>
            <Outlet />
          </RootDocument>
        </ThemeProvider>
      </SessionProvider>
    </QueryProvider>
  )
}

// Fetches session client-side and provides user context
function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession()
  const user = session?.user || null
  
  return (
    <UserProvider user={user} isLoading={isLoading}>
      {children}
    </UserProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const structuredDataScript = useMemo(
    () => JSON.stringify(STRUCTURED_DATA),
    []
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Schema.org structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredDataScript,
          }}
        />
        {/* Theme script - runs before React to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* Google Analytics 4 - for better SEO tool detection */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-TASTEUI"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TASTEUI');
            `,
          }}
        />
        <Scripts />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" />
        {/* Devtools - only loaded in development */}
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </Suspense>
        )}
        {/* Cloudflare Web Analytics - placed before closing body tag as per CF docs */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "f8a26a6e1ffe4a04b8d5030717d0bf63"}' />
      </body>
    </html>
  )
}
