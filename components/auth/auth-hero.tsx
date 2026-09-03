import { SkilloraLogo } from "@/components/skillora-logo"
import { Check } from "lucide-react"

const points = [
  "Deterministic readiness scores you can explain",
  "Skill gaps ranked by real job demand",
  "A learning path that maps straight to hiring",
]

export function AuthHero() {
  return (
    <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <SkilloraLogo className="size-5" />
        </div>
        <span className="text-lg font-semibold text-sidebar-primary">Skillora</span>
      </div>

      <div className="max-w-md">
        <h2 className="text-3xl font-semibold leading-tight text-sidebar-primary text-balance">
          Turn your skills into a clear path to employment.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70 text-pretty">
          Skillora assesses what you know, measures it against real role
          requirements, and shows you exactly what to learn next.
        </p>
        <ul className="mt-8 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-sidebar-foreground/85">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 text-sidebar-primary">
                <Check className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-sidebar-foreground/50">
        Skill-to-Job Intelligence · Prototype
      </p>
    </div>
  )
}
