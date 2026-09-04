import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Briefcase,
  Sparkles,
  Award,
  ClipboardCheck,
} from "lucide-react"

import {
  jobs,
  activities,
  skills,
  type Activity,
} from "@/lib/mock-data"

import { getUserProfile } from "@/lib/supabase-user"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { MetricCard } from "@/components/metric-card"
import { JobCard } from "@/components/job-card"
import { ReadinessRing } from "@/components/readiness-ring"
import { SkillBadge } from "@/components/skill-badge"
import { ProgressBar } from "@/components/progress-bar"
import { StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"

const activityIcons: Record<Activity["type"], typeof BookOpen> = {
  course: BookOpen,
  job: Briefcase,
  skill: Award,
  assessment: ClipboardCheck,
}

export default async function DashboardPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/setup-profile")
  }

  const user = {
    name: profile.name,
    initials: profile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    targetRole: profile.target_role ?? "Not selected",
    experience: profile.experience_level ?? "Not selected",
    jobReadiness: profile.job_readiness ?? 0,
    skillsMastered: profile.skills_mastered ?? 0,
    skillGaps: profile.skill_gaps ?? 0,
    learningProgress: profile.learning_progress ?? 0,
  }

  const recommendedJobs = [...jobs]
    .sort((a, b) => b.readiness - a.readiness)
    .slice(0, 2)

  const masteredSkills = skills
    .filter((s) => s.status === "mastered")
    .slice(0, 6)

  const gapSkills = skills.filter((s) => s.status === "gap")

  return (
    <div>

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-xl">

            <StatusBadge
              tone="primary"
              icon={<Sparkles className="size-3.5" />}
            >
              AI analysis up to date
            </StatusBadge>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground text-balance">
              Welcome back, {user.name.split(" ")[0]}
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
              You're working toward{" "}
              <span className="font-medium text-foreground">
                {user.targetRole}
              </span>
              .
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                <Target className="size-4 text-primary" />
                {user.targetRole}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                {user.experience}
              </span>

              <Link
                href="/assessment"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                })}
              >
                Update assessment
                <ArrowRight className="size-3.5" />
              </Link>

            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center rounded-lg bg-secondary/60 px-8 py-4">
            <ReadinessRing value={user.jobReadiness} size={150} />
          </div>

        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MetricCard
          label="Job Readiness"
          value={user.jobReadiness}
          unit="%"
          icon={Target}
          tone="primary"
          hint="complete your assessment"
        />

        <MetricCard
          label="Skills Mastered"
          value={user.skillsMastered}
          icon={CheckCircle2}
          tone="success"
          hint="skills completed"
        />

        <MetricCard
          label="Skill Gaps"
          value={user.skillGaps}
          icon={AlertTriangle}
          tone="warning"
          hint="to close for target role"
        />

        <MetricCard
          label="Learning Progress"
          value={user.learningProgress}
          unit="%"
          icon={GraduationCap}
          tone="neutral"
          hint="roadmap progress"
        />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="space-y-6 lg:col-span-2">

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Recommended Jobs
              </h2>

              <Link
                href="/jobs"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skills Snapshot</CardTitle>

              <Link
                href="/gap-analysis"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Full analysis
                <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-success">
                  Mastered
                </p>

                <div className="flex flex-wrap gap-2">
                  {masteredSkills.length > 0 ? (
                    masteredSkills.map((s) => (
                      <SkillBadge
                        key={s.name}
                        name={s.name}
                        status="mastered"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete your assessment to build your skill profile.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warning">
                  Skill Gaps
                </p>

                <div className="flex flex-wrap gap-2">
                  {user.skillGaps > 0 ? (
                    gapSkills.map((s) => (
                      <SkillBadge
                        key={s.name}
                        name={s.name}
                        status="gap"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skill gaps identified yet.
                    </p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>

              <StatusBadge tone="primary">
                {user.learningProgress}%
              </StatusBadge>
            </CardHeader>

            <CardContent className="space-y-4">

              <ProgressBar
                value={user.learningProgress}
                tone="primary"
              />

              <div className="space-y-3">
                <ProgressBar
                  value={user.learningProgress}
                  tone="primary"
                  label="Your learning roadmap"
                  showLabel
                  size="sm"
                />
              </div>

              <Link
                href="/roadmap"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
              >
                Open learning roadmap
                <ArrowRight className="size-3.5" />
              </Link>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <ul className="divide-y divide-border">

                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type]

                  return (
                    <li
                      key={activity.id}
                      className="flex gap-3 px-5 py-3.5"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="size-4" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.label}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {activity.detail}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                          {activity.time}
                        </p>
                      </div>
                    </li>
                  )
                })}

              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
