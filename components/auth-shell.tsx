import Link from 'next/link'
import { CheckCircle2, Route, Target } from 'lucide-react'
import { SkilloraMark } from '@/components/skillora-logo'

const highlights = [
  { icon: Target, text: 'Map your skills to real job requirements' },
  { icon: Route, text: 'Get a personalized learning roadmap' },
  { icon: CheckCircle2, text: 'Track your readiness for every role' },
]

/**
 * Two-panel authentication layout. Navy brand rail on the left (desktop),
 * form on the right. Shared by login and sign-up so branding stays identical.
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand rail */}
      <aside className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <SkilloraMark className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-primary">
              Skillora
            </p>
            <p className="text-[11px] text-sidebar-foreground/70">
              Skill-to-Job Intelligence Platform
            </p>
          </div>
        </Link>

        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-sidebar-primary text-balance">
            Build the right skills. Become ready for the right opportunity.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/70 text-pretty">
            From skill gaps to employment readiness — Skillora turns where you
            are into a clear path toward where you want to go.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => {
              const Icon = h.icon
              return (
                <li key={h.text} className="flex items-center gap-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sidebar-foreground/85">{h.text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="text-[11px] text-sidebar-foreground/50">
          Smart India Hackathon — Employability Intelligence
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Compact brand for mobile */}
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 lg:hidden"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <SkilloraMark className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Skillora</p>
              <p className="text-[11px] text-muted-foreground">
                Skill-to-Job Intelligence
              </p>
            </div>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
