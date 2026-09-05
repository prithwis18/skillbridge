"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Target,
} from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { PageHeader } from "@/components/page-header"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Skill = {
  name: string
  category: string
  proficiency: number
  required: number
  status: "mastered" | "in-progress" | "gap"
}

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
          <span className="text-sm font-medium text-foreground">
            {skill.name}
          </span>

          <span className="text-xs text-muted-foreground">
            {skill.category}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-muted-foreground">
            You{" "}
            <span className="font-semibold text-foreground">
              {skill.proficiency}%
            </span>
          </span>

          <span className="text-muted-foreground">
            Target{" "}
            <span className="font-semibold text-foreground">
              {skill.required}%
            </span>
          </span>
        </div>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-border"
          style={{ width: `${skill.required}%` }}
        />

        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            barColor
          )}
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
  const [loading, setLoading] = useState(true)
  const [targetRole, setTargetRole] = useState("your target role")
  const [assessmentSkills, setAssessmentSkills] = useState<string[]>([])
  const [readiness, setReadiness] = useState(0)

  useEffect(() => {
    async function loadAssessment() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("target_role")
          .eq("id", user.id)
          .single()

        const saved = localStorage.getItem(
          `skillbridge-assessment-result-${user.id}`
        )

        if (saved) {
          const result = JSON.parse(saved)

          setAssessmentSkills(
            Array.isArray(result.skills) ? result.skills : []
          )

          if (result.role) {
            setTargetRole(result.role)
          } else if (profile?.target_role) {
            setTargetRole(profile.target_role)
          }

          if (typeof result.readiness === "number") {
            setReadiness(result.readiness)
          }
        } else if (profile?.target_role) {
          setTargetRole(profile.target_role)
        }
      } catch (error) {
        console.error("Gap analysis loading error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading skill gap analysis...
        </p>
      </div>
    )
  }

  const skillDefinitions: Record<
    string,
    { category: string; required: number }
  > = {
    Python: { category: "Programming", required: 80 },
    Java: { category: "Programming", required: 80 },
    JavaScript: { category: "Programming", required: 80 },
    TypeScript: { category: "Programming", required: 75 },
    SQL: { category: "Database", required: 80 },
    Git: { category: "Tools", required: 75 },
    DSA: { category: "Computer Science", required: 80 },
    "REST APIs": { category: "Backend", required: 80 },
    React: { category: "Frontend", required: 75 },
    "Next.js": { category: "Frontend", required: 70 },
    "Node.js": { category: "Backend", required: 75 },
    Docker: { category: "DevOps", required: 65 },
    AWS: { category: "Cloud", required: 65 },
    MongoDB: { category: "Database", required: 70 },
    PostgreSQL: { category: "Database", required: 75 },
    "Machine Learning": {
      category: "AI / ML",
      required: 70,
    },
  }

  const skills: Skill[] = assessmentSkills.map((name, index) => {
    const definition = skillDefinitions[name] ?? {
      category: "Technical Skill",
      required: 75,
    }

    const proficiency = Math.min(
      95,
      Math.max(
        20,
        35 + Math.min(index * 7, 28) + Math.round(readiness * 0.15)
      )
    )

    const status: Skill["status"] =
      proficiency >= definition.required
        ? "mastered"
        : proficiency >= definition.required - 20
          ? "in-progress"
          : "gap"

    return {
      name,
      category: definition.category,
      required: definition.required,
      proficiency,
      status,
    }
  })

  const mastered = skills.filter((s) => s.status === "mastered")
  const inProgress = skills.filter((s) => s.status === "in-progress")
  const gaps = skills.filter((s) => s.status === "gap")

  const projectedReadiness = Math.min(
    100,
    Math.max(
      readiness,
      readiness + Math.min(inProgress.length * 3, 15)
    )
  )

  return (
    <div>
      <PageHeader
        title="Skill Gap Analysis"
        description={`AI comparison of your skills against the ${targetRole} benchmark.`}
        action={
          <Link
            href="/roadmap"
            className={buttonVariants({ size: "sm" })}
          >
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

      <Card className="mb-6 border-primary/20 bg-accent/40">
        <CardContent className="flex items-start gap-3 p-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Target className="size-5" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              AI Summary
            </p>

            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {skills.length === 0 ? (
                <>
                  Complete your assessment to generate a personalized skill
                  gap analysis.
                </>
              ) : (
                <>
                  You have a strong foundation with{" "}
                  {mastered.length} skills at or above the{" "}
                  {targetRole} benchmark. Prioritise{" "}
                  <span className="font-medium text-warning">
                    {gaps.map((g) => g.name).join(", ") ||
                      "your remaining skill gaps"}
                  </span>{" "}
                  to improve your overall readiness. Completing your
                  in-progress skills (
                  {inProgress.map((s) => s.name).join(", ") ||
                    "none"}
                  ) could raise your estimated readiness to{" "}
                  {projectedReadiness}%.
                </>
              )}
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
                  <span className="size-2.5 rounded-full bg-success" />
                  You
                </span>

                <span className="inline-flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-border" />
                  Target
                </span>
              </div>
            </CardHeader>

            <CardContent className="divide-y divide-border py-0">
              {skills.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No assessment skills found. Please complete the assessment
                  first.
                </div>
              ) : (
                skills.map((skill) => (
                  <SkillRow key={skill.name} skill={skill} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Gaps</CardTitle>

              <StatusBadge tone="warning">
                {gaps.length}
              </StatusBadge>
            </CardHeader>

            <CardContent className="space-y-3">
              {gaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No critical gaps detected.
                </p>
              ) : (
                gaps.map((g) => (
                  <div
                    key={g.name}
                    className="flex items-center justify-between rounded-md border border-warning/20 bg-warning-muted/50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {g.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {g.category}
                      </p>
                    </div>

                    <span className="text-sm font-semibold tabular-nums text-warning">
                      +{g.required - g.proficiency}%
                    </span>
                  </div>
                ))
              )}

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
              {mastered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No mastered skills yet.
                </p>
              ) : (
                mastered.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success-muted px-2.5 py-1 text-xs font-medium text-success"
                  >
                    <CheckCircle2 className="size-3.5" />
                    {s.name}
                  </span>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

