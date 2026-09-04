import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Target,
} from "lucide-react"
import { skills, user, type Skill } from "@/lib/mock-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { PageHeader } from "@/components/page-header"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function SkillRow({ skill }: { skill: Skill }) {
  const deficit = Math.max(0, skill.required - skill.proficiency)
  const barColor =
    skill.status === "mastered"
      ? "bg-success"
      : skill.status === "in-progress"
        ? "bg-primary"
        : "bg-warning"

  return (
    <div className="py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{skill.name}</span>
          <span className="text-xs text-muted-foreground">{skill.category}</span>
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-muted-foreground">
            You <span className="font-semibold text-foreground">{skill.proficiency}%</span>
          </span>
          <span className="text-muted-foreground">
            Target <span className="font-semibold text-foreground">{skill.required}%</span>
          </span>
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {/* required marker track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-border"
          style={{ width: `${skill.required}%` }}
        />
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", barColor)}
          style={{ width: `${skill.proficiency}%` }}
        />
      </div>
      {deficit > 0 && (
        <p className="mt-1.5 text-xs text-warning">
          {deficit}% below target
        </p>
      )}
    </div>
  )
}

export default function GapAnalysisPage() {
  const mastered = skills.filter((s) => s.status === "mastered")
  const inProgress = skills.filter((s) => s.status === "in-progress")
  const gaps = skills.filter((s) => s.status === "gap")

  return (
    <div>
      <PageHeader
        title="Skill Gap Analysis"
        description={`AI comparison of your skills against the ${user.targetRole} benchmark.`}
        action={
          <Link href="/roadmap" className={buttonVariants({ size: "sm" })}>
            View learning roadmap
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Mastered Skills"
          value={mastered.length}
          icon={CheckCircle2}
          tone="success"
          hint="meet or exceed target"
        />
        <MetricCard
          label="In Progress"
          value={inProgress.length}
          icon={Clock}
          tone="primary"
          hint="approaching target"
        />
        <MetricCard
          label="Critical Gaps"
          value={gaps.length}
          icon={AlertTriangle}
          tone="warning"
          hint="need focused learning"
        />
      </div>

      {/* AI summary */}
      <Card className="mb-6 border-primary/20 bg-accent/40">
        <CardContent className="flex items-start gap-3 p-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Target className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Summary</p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              You have a strong foundation with {mastered.length} skills at or above the{" "}
              {user.targetRole} benchmark. Prioritise{" "}
              <span className="font-medium text-warning">
                {gaps.map((g) => g.name).join(", ")}
              </span>{" "}
              to unlock higher-readiness roles. Completing your in-progress skills (
              {inProgress.map((s) => s.name).join(", ")}) would raise your overall
              readiness to an estimated 82%.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Benchmark</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-success" /> You
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-border" /> Target
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border py-0">
              {skills.map((skill) => (
                <SkillRow key={skill.name} skill={skill} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Gaps</CardTitle>
              <StatusBadge tone="warning">{gaps.length}</StatusBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              {gaps.map((g) => (
                <div
                  key={g.name}
                  className="flex items-center justify-between rounded-md border border-warning/20 bg-warning-muted/50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.category}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-warning">
                    +{g.required - g.proficiency}%
                  </span>
                </div>
              ))}
              <Link
                href="/roadmap"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
              >
                Build roadmap to close gaps
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {mastered.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success-muted px-2.5 py-1 text-xs font-medium text-success"
                >
                  <CheckCircle2 className="size-3.5" />
                  {s.name}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
