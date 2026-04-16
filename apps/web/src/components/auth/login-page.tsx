"use client"

import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons"
import { useSignInWithGitHub, useSignInWithGoogle } from "@/lib/queries/auth"

export function LoginPage() {
  const signInWithGitHub = useSignInWithGitHub()
  const signInWithGoogle = useSignInWithGoogle()

  const handleGitHubSignIn = async () => {
    await signInWithGitHub.mutateAsync()
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle.mutateAsync()
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,var(--brand)/6%,transparent_70%)]" style={{ willChange: "transform" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.webp"
              alt="TasteUI"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="text-base font-semibold text-foreground tracking-tight">
              tasteui
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-16">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-2">
              <img
                src="/logo.webp"
                alt="TasteUI"
                className="h-8 w-8 rounded-lg object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Sign in to continue to tasteui
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-8">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 h-12 text-base font-medium border-foreground/20 hover:bg-foreground/5 hover:border-foreground/30 transition-all"
              onClick={handleGitHubSignIn}
              disabled={signInWithGitHub.isPending}
            >
              <HugeiconsIcon icon={GithubIcon} className="size-5" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 h-12 text-base font-medium border-foreground/20 hover:bg-foreground/5 hover:border-foreground/30 transition-all"
              onClick={handleGoogleSignIn}
              disabled={signInWithGoogle.isPending}
            >
              <HugeiconsIcon icon={GoogleIcon} className="size-5" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
