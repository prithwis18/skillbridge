"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  GitCompareArrows,
  Route,
  Briefcase,
  Target,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SkilloraLogo } from "@/components/skillora-logo"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Skill Assessment", icon: ClipboardList },
  { href: "/gap-analysis", label: "Skill Gap Analysis", icon: GitCompareArrows },
  { href: "/roadmap", label: "Learning Roadmap", icon: Route },
  { href: "/jobs", label: "Job Matches", icon: Briefcase },
  { href: "/readiness", label: "Job Readiness", icon: Target },
  { href: "/profile", label: "Profile", icon: UserCircle },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6"
      >
        <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <SkilloraLogo className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-primary">Skillora</p>
          <p className="text-[11px] text-sidebar-foreground/70">Skill-to-Job Intelligence</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md bg-sidebar-accent/50 p-3">
          <p className="text-xs font-medium text-sidebar-primary">Deterministic Intelligence</p>
          <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/70">
            Every readiness score is computed from real role requirements — explainable, not a black box.
          </p>
        </div>
      </div>
    </aside>
  )
}
