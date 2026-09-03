import Link from "next/link"
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react"
import {
  user,
  skillCoverage,
  priorityGaps,
  careerInsight,
  overallReadiness,
  matchedCount,
  coreCount,
  criticalGapCount,
  type CoverageCategory,
  type PriorityGap,
} from "@/lib/mock-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { PageHeader } from "@/components/page-header"
import { ReadinessRing } from "@/components/readiness-ring"
import { StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function scoreTone(score: number) {
  if (score >= 70) return "bg-success"
  if (score >= 45) return "bg-warning"
  return "bg-destructive"
}

function CoverageCard({ cat }: { cat: CoverageCategory }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
        <span className="text-sm font-semibold tabular-nums text-foreground">{cat.score}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", scoreTone(cat.score))}
          style={{ width: `${cat.score}%` }}
        />
      </div>

      {cat.matched.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-success">
            Matched
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cat.matched.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md border border-success/25 bg-success-muted px-2 py-0.5 text-xs font-medium text-success"
              >
                <CheckCircle2 className="size-3" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {cat.missing.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-warning">
            Missing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cat.missing.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md border border-warning/25 bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning"
              >
                <X className="size-3" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function priorityTone(priority: PriorityGap["priority"]) {
  if (priority === "High") return "warning" as const
  if (priority === "Medium") return "primary" as const
  return "neutral" as const
}

export default function GapAnalysisPage() {
  return (
    <div>
      <PageHeader
        title="AI Skill Gap Analysis"
        description={`${user.targetRole} — compared against current industry requirements.`}
        action={
          <Link href="/roadmap" className={buttonVariants({ size: "sm" })}>
            View learning roadmap
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      {/* Overall readiness summary */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-6">
            <ReadinessRing value={overallReadiness} size={130} label="Ready" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall readiness</p>
              <p className="mt-1 max-w-xs text-sm text-foreground text-pretty">
                You meet{" "}
                <span className="font-semibold text-success">{matchedCount} of {coreCount}</span>{" "}
                role requirements with{" "}
                <span className="font-semibold text-warning">{criticalGapCount} critical gaps</span>{" "}
                remaining.
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-3 sm:w-auto">
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-success">{matchedCount}</p>
              <p className="text-[11px] text-muted-foreground">Matched</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-primary">
                {coreCount - matchedCount}
              </p>
              <p className="text-[11px] text-muted-foreground">To improve</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-warning">{criticalGapCount}</p>
              <p className="text-[11px] text-muted-foreground">Critical</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Skill coverage map */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Skill Coverage Map</h2>
            <span className="text-xs text-muted-foreground">6 categories</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {skillCoverage.map((cat) => (
              <CoverageCard key={cat.name} cat={cat} />
            ))}
          </div>
        </div>

        {/* Priority gaps + AI insight */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">Priority Gaps</h2>
            <div className="space-y-3">
              {priorityGaps.map((g) => (
                <Card key={g.rank} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                      {String(g.rank).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{g.skill}</p>
                        <StatusBadge tone={priorityTone(g.priority)}>
                          {g.priority} priority
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground text-pretty">{g.reason}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Career Insight (explanation layer) */}
          <Card className="border-primary/20 bg-accent/40">
            <CardHeader className="border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Career Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground text-pretty">{careerInsight.why}</p>
              <p className="text-sm text-foreground text-pretty">{careerInsight.what}</p>
              <p className="text-sm font-medium text-foreground text-pretty">{careerInsight.next}</p>
              <details className="group mt-1">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-primary">
                  Why this matters
                  <ArrowRight className="size-3.5 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-2 space-y-2 border-l-2 border-primary/20 pl-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Why: </span>
                    Employers weight deployment and cloud skills heavily for backend roles, so gaps
                    here reduce your match rate more than any other category.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">What: </span>
                    AWS and Docker appear in the majority of your target job requirements.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Next action: </span>
                    Start the Docker Fundamentals step on your roadmap — it&apos;s the fastest
                    readiness gain.
                  </p>
                </div>
              </details>
              <Link
                href="/roadmap"
                className={cn(buttonVariants({ size: "sm" }), "mt-1 w-full")}
              >
                Close these gaps
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
