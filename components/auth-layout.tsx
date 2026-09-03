import { CheckCircle2 } from "lucide-react"
import { Logo, LogoMark } from "@/components/logo"

const valueProps = [
  "Assess your real skill level against target roles",
  "See exactly which skills you're missing and why",
  "Follow a personalized path to job readiness",
  "Match to jobs you can actually become ready for",
]

export function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode
  heading: string
  subheading?: string
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Logo tone="sidebar" />

        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/60">
            Skill-to-Job Intelligence Platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-balance text-sidebar-primary">
            Build the right skills. Become ready for the right opportunity.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {valueProps.map((v) => (
              <li key={v} className="flex items-start gap-3 text-sm text-sidebar-foreground/85">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-sidebar-foreground/60">
          From skill gaps to employment readiness.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary p-1.5 text-primary-foreground">
              <LogoMark />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">Skillora</p>
              <p className="text-[11px] text-muted-foreground">Skill-to-Job Intelligence</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              {heading}
            </h1>
            {subheading && (
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{subheading}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
