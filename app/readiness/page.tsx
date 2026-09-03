"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MinusCircle,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react"
import {
  jobReadinessDetail,
  jobs,
  skills,
  type JobRequirementComparison,
} from "@/lib/mock-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { PageHeader } from "@/components/page-header"
import { ReadinessRing } from "@/components/readiness-ring"
import { ProgressBar } from "@/components/progress-bar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const statusMeta: Record<
  JobRequirementComparison["status"],
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  have: { label: "Meets requirement", tone: "text-success", icon: CheckCircle2 },
  partial: { label: "Almost there", tone: "text-warning", icon: MinusCircle },
  missing: { label: "Missing", tone: "text-destructive", icon: XCircle },
}

// Build a per-job readiness comparison from the single source of truth.
function buildComparison(requirementNames: string[]): JobRequirementComparison[] {
  return requirementNames.map((name) => {
    const s = skills.find((sk) => sk.name === name)
    const proficiency = s?.proficiency ?? 0
    const required = s?.required ?? 75
    const ratio = required > 0 ? proficiency / required : 1
    const status: JobRequirementComparison["status"] =
      ratio >= 1 ? "have" : ratio >= 0.5 ? "partial" : "missing"
    return { skill: name, required, proficiency, status }
  })
}

export default function ReadinessPage() {
  const selectableJobs = jobs.slice(0, 6)
  const [selectedId, setSelectedId] = useState(jobReadinessDetail.job.id)

  const selectedJob =
    selectableJobs.find((j) => j.id === selectedId) ?? jobReadinessDetail.job

  const comparison = useMemo(() => {
    const names = Array.from(
      new Set([...selectedJob.matchedSkills, ...selectedJob.missingSkills]),
    )
    return buildComparison(names)
  }, [selectedJob])

  const blockers = comparison
    .filter((c) => c.status !== "have")
    .sort((a, b) => a.proficiency / a.required - b.proficiency / b.required)

  const fastestPath = [...blockers].sort((a, b) => {
    const rank = { partial: 0, missing: 1, have: 2 } as const
    return rank[a.status] - rank[b.status]
  })

  const estimatedHours = blockers.reduce(
    (acc, b) => acc + (b.status === "missing" ? 6 : 3),
    0,
  )
  const projectedReadiness = Math.min(
    95,
    selectedJob.readiness + blockers.length * 8,
  )

  return (
    <div>
      <PageHeader
        title="Job-Specific Readiness"
        description="See exactly how ready you are for a specific role, why you're not there yet, and the fastest path to qualify."
        action={
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Browse all roles
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      {/* Role selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {selectableJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => setSelectedId(job.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
              job.id === selectedId
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span className="font-semibold">{job.title}</span>
            <span className="text-muted-foreground">· {job.company}</span>
            <span
              className={cn(
                "ml-1 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
                job.readiness >= 75
                  ? "bg-success-muted text-success"
                  : job.readiness >= 55
                    ? "bg-warning-muted text-warning"
                    : "bg-destructive/10 text-destructive",
              )}
            >
              {job.readiness}%
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Readiness summary */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <ReadinessRing value={selectedJob.readiness} size={160} label="Ready" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedJob.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedJob.company} · {selectedJob.location}
              </p>
            </div>
            <div className="w-full rounded-lg bg-secondary/60 p-3 text-left">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Target className="size-3.5 text-primary" />
                Projected after closing gaps
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-semibold tabular-nums text-success">
                  {projectedReadiness}%
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="size-3.5" />+
                  {projectedReadiness - selectedJob.readiness}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />~{estimatedHours} hours of focused learning
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile vs requirements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Profile vs Role Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparison.map((c) => {
              const meta = statusMeta[c.status]
              const Icon = meta.icon
              return (
                <div key={c.skill}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("size-4", meta.tone)} />
                      <span className="text-sm font-medium text-foreground">
                        {c.skill}
                      </span>
                      <span className={cn("text-xs", meta.tone)}>
                        · {meta.label}
                      </span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {c.proficiency}/{c.required}
                    </span>
                  </div>
                  <div className="relative">
                    <ProgressBar
                      value={c.proficiency}
                      max={100}
                      tone={
                        c.status === "have"
                          ? "success"
                          : c.status === "partial"
                            ? "warning"
                            : "primary"
                      }
                      size="sm"
                    />
                    <span
                      className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-foreground/50"
                      style={{ left: `${c.required}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )
            })}
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <span className="inline-block h-3 w-0.5 rounded-full bg-foreground/50" />
              The marker shows the proficiency this role expects.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Why not ready */}
        <Card>
          <CardHeader>
            <CardTitle>Why You&apos;re Not Ready Yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You meet every core requirement for this role — you&apos;re ready to
                apply.
              </p>
            ) : (
              blockers.map((b) => (
                <div
                  key={b.skill}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      b.status === "missing"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning-muted text-warning",
                    )}
                  >
                    {b.status === "missing" ? (
                      <XCircle className="size-4" />
                    ) : (
                      <MinusCircle className="size-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.skill}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.status === "missing"
                        ? `Not in your profile yet — the role expects around ${b.required}%.`
                        : `You're at ${b.proficiency}%, ${b.required - b.proficiency} points below the ${b.required}% this role expects.`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Fastest path */}
        <Card>
          <CardHeader>
            <CardTitle>Fastest Path to Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fastestPath.map((b, i) => (
              <div key={b.skill} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Learn {b.skill}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.status === "missing" ? "~6 hours" : "~3 hours"} · closes a{" "}
                    {b.required - b.proficiency}-point gap
                  </p>
                </div>
                {i < fastestPath.length - 1 && (
                  <ArrowRight className="size-4 text-muted-foreground" />
                )}
              </div>
            ))}
            <Link
              href="/roadmap"
              className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
            >
              Start this learning path
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
