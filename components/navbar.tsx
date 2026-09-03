"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, Sparkles, LogOut, UserRound } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const handleSignOut = () => {
    signOut()
    router.replace("/login")
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
          placeholder="Search skills, jobs, roadmap..."
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {user?.isDemo && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/25 bg-warning-muted px-2.5 py-1 text-xs font-medium text-warning">
            <Sparkles className="size-3.5" />
            Demo Profile
          </span>
        )}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-md border-l border-border pl-3 pr-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user?.initials ?? "U"}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name ?? "Guest"}</p>
              <p className="text-xs text-muted-foreground">{user?.targetRole ?? "No target role"}</p>
            </div>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-md"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent"
              >
                <UserRound className="size-4 text-muted-foreground" />
                Career Profile
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent"
              >
                <LogOut className="size-4 text-muted-foreground" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
