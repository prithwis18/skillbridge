import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type PipelineStep = {
  id: string
  label: string
  status: "done" | "current" | "upcoming"
  note?: string
}

/**
 * Horizontal (desktop) / vertical (mobile) progression rail used for the
 * career-readiness pipeline and the employment journey. Communicates the
 * whole skill-to-job flow at a glance.
 */
export function CareerPipeline({
  steps,
  className,
}: {
  steps: PipelineStep[]
  className?: string
}) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0",
        className,
      )}
    >
      {steps.map((step, i) => {
        const last = i === steps.length - 1
        return (
          <li
            key={step.id}
            className="flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
          >
            {/* Node + connectors */}
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              {/* left connector spacer (desktop) keeps nodes evenly spaced */}
              <span className="hidden h-0.5 flex-1 sm:block" aria-hidden />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  step.status === "done" && "border-success bg-success text-success-foreground",
                  step.status === "current" &&
                    "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
                  step.status === "upcoming" && "border-border bg-card text-muted-foreground",
                )}
              >
                {step.status === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              {/* right connector (desktop horizontal) */}
              {!last && (
                <span
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    step.status === "done" ? "bg-success" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
              {/* vertical connector (mobile) */}
              {!last && (
                <span
                  className={cn(
                    "mt-1 w-0.5 flex-1 sm:hidden",
                    step.status === "done" ? "bg-success" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-6 sm:mt-3 sm:pb-0">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  step.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {step.note && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{step.note}</p>
              )}
              {step.status === "current" && !step.note && (
                <p className="mt-0.5 text-[11px] font-medium text-primary">You are here</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
