"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Search, Menu, LogOut } from "lucide-react"
import { user as demoUser } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"

type SessionUser = {
  name: string
  email: string
  initials: string
} | null

function initialsFrom(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const [sessionUser, setSessionUser] = useState<SessionUser>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const hydrate = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const name =
          (user.user_metadata?.name as string) ?? user.email ?? "Member"
        setSessionUser({
          name,
          email: user.email ?? "",
          initials: initialsFrom(name),
        })
      } else {
        setSessionUser(null)
      }
      setLoaded(true)
    }

    hydrate()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => hydrate())

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isDemo = loaded && !sessionUser
  const display = sessionUser ?? {
    name: demoUser.name,
    email: demoUser.targetRole,
    initials: demoUser.initials,
  }

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
          placeholder="Search skills, jobs, courses..."
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {isDemo && (
          <span className="hidden items-center gap-1.5 rounded-md border border-warning/40 bg-warning-muted px-2.5 py-1 text-xs font-medium text-warning sm:inline-flex">
            <span className="size-1.5 rounded-full bg-warning" />
            Demo Profile
          </span>
        )}

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-warning ring-2 ring-card" />
        </Button>

        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {display.initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="max-w-[12rem] truncate text-sm font-medium text-foreground">
              {display.name}
            </p>
            <p className="max-w-[12rem] truncate text-xs text-muted-foreground">
              {display.email}
            </p>
          </div>

          {sessionUser ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut className="size-4.5" />
            </Button>
          ) : (
            <Link
              href="/auth/login"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
