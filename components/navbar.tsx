"use client"

import Link from "next/link"
import { Bell, Search, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/lib/profile-context"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, isAuthed } = useProfile()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search skills, roles, courses..."
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {profile.isDemo && (
          <span className="hidden items-center gap-1.5 rounded-full border border-info/25 bg-info-muted px-2.5 py-1 text-xs font-medium text-info sm:inline-flex">
            <Sparkles className="size-3.5" />
            Demo Mode
          </span>
        )}

        {!isAuthed && (
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
        )}

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-warning ring-2 ring-card" />
        </Button>

        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-md border-l border-border pl-3 transition-opacity hover:opacity-80"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initialsOf(profile.name)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">
              {profile.targetRole || "Set your target role"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}
