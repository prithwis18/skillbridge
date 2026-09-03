"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { LogoMark } from "@/components/logo"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

const PUBLIC_ROUTES = ["/login", "/signup"]
const ONBOARDING_ROUTE = "/onboarding"

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-11 animate-pulse items-center justify-center rounded-md bg-primary p-2 text-primary-foreground">
          <LogoMark />
        </div>
        <p className="text-sm text-muted-foreground">Loading Skillora…</p>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublic = PUBLIC_ROUTES.includes(pathname)
  const isOnboarding = pathname === ONBOARDING_ROUTE

  useEffect(() => {
    if (loading) return
    if (!user && !isPublic) {
      router.replace("/login")
    } else if (user && !user.onboarded && !isOnboarding) {
      router.replace("/onboarding")
    } else if (user && user.onboarded && (isPublic || isOnboarding)) {
      router.replace("/")
    }
  }, [loading, user, isPublic, isOnboarding, router])

  if (loading) return <Splash />

  // Auth + onboarding screens render without the app chrome.
  if (isPublic || isOnboarding) {
    // Guard against a flash of the wrong screen during redirect.
    if (isPublic && user && user.onboarded) return <Splash />
    if (isOnboarding && !user) return <Splash />
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // App routes require an authenticated, onboarded user.
  if (!user || !user.onboarded) return <Splash />

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:sticky md:top-0 md:block md:h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className={cn("flex min-w-0 flex-1 flex-col")}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
