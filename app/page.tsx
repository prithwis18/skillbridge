"use client"

import Link from "next/link"
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Briefcase,
  Award,
  ClipboardCheck,
} from "lucide-react"
import {
  user,
  jobs,
  activities,
  skills,
  careerPipeline,
  type Activity,
} from "@/lib/mock-data"
import { useAuth } from "@/components/auth-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { MetricCard } from "@/components/metric-card"
import { JobCard } from "@/components/job-card"
import { ReadinessRing } from "@/components/readiness-ring"
import { SkillBadge } from "@/components/skill-badge"
import { ProgressBar } from "@/components/progress-bar"
import { CareerPipeline } from "@/components/career-pipeline"
import { buttonVariants } from "@/components/ui/button"

const activityIcons: Record<Activity["type"], typeof BookOpen> = {
  course: BookOpen,
  job: Briefcase,
  skill: Award,
  assessment: ClipboardCheck,
}

export default function DashboardPage() {
  const { user: session } = useAuth()
  const firstName = (session?.name ?? user.name).split(" ")[0]
  const targetRole = session?.targetRole ?? user.targetRole

  const recommendedJobs = [...jobs].sort((a, b) => b.readiness - a.readiness).slice(0, 2)
  const masteredSkills = skills.filter((s) => s.status === "mastered").slice(0, 6)
  const gapSkills = skills.filter((s) => s.status === "gap")

  return (
    <div>
      {/* Hero: readiness statement */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground text-balance">
              You&apos;re {user.jobReadiness}% ready for{" "}
              <span className="text-primary">{targetRole}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              You meet {user.skillsMatched} of {user.skillsRequired} role requirements. Close your{" "}
              {user.criticalGaps} critical gaps to reach interview-ready status.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                <Target className="size-4 text-primary" />
                {targetRole}
              </span>
              <Link href="/gap-analysis" className={buttonVariants({ size: "sm" })}>
                View skill gaps
                <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/assessment" className={buttonVariants({ size: "sm", variant: "outline" })}>
                Update assessment
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-secondary/60 px-8 py-4">
            <ReadinessRing value={user.jobReadiness} size={150} label="Ready" />
          </div>
        </div>
      </Card>

      {/* Career readiness pipeline (signature visual) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Career Readiness</CardTitle>
          <span className="text-xs text-muted-foreground">Skill-to-employment journey</span>
        </CardHeader>
        <CardContent className="py-6">
          <CareerPipeline steps={careerPipeline} />
        </CardContent>
      </Card>

      {/* Headline metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Skills Matched"
          value={`${user.skillsMatched} / ${user.skillsRequired}`}
          icon={CheckCircle2}
          tone="success"
          hint="role requirements met"
        />
        <MetricCard
          label="Critical Gaps"
          value={user.criticalGaps}
          icon={AlertTriangle}
          tone="warning"
          hint="high-priority skills to close"
        />
        <MetricCard
          label="Recommended Jobs"
          value={user.recommendedJobs}
          icon={Briefcase}
          tone="primary"
          hint="roles you can target"
        />
        <MetricCard
          label="Learning Progress"
          value={user.learningProgress}
          unit="%"
          icon={GraduationCap}
          tone="neutral"
          trend={{ value: "+12%", direction: "up" }}
          hint="roadmap complete"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Jobs You Can Target</h2>
              <Link href="/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
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
              <Link href="/gap-analysis" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Full analysis
                <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-success">
                  Matched
                </p>
                <div className="flex flex-wrap gap-2">
                  {masteredSkills.map((s) => (
                    <SkillBadge key={s.name} name={s.name} status="mastered" />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-warning">
                  Critical Gaps
                </p>
                <div className="flex flex-wrap gap-2">
                  {gapSkills.map((s) => (
                    <SkillBadge key={s.name} name={s.name} status="gap" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <Link href="/roadmap" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Roadmap
                <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar value={user.learningProgress} tone="primary" label="Overall" showLabel />
              <div className="space-y-3">
                <ProgressBar value={60} tone="primary" label="Node.js Backend Masterclass" showLabel size="sm" />
                <ProgressBar value={35} tone="warning" label="Docker & Containers" showLabel size="sm" />
                <ProgressBar value={100} tone="success" label="SQL Deep Dive" showLabel size="sm" />
              </div>
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
                    <li key={activity.id} className="flex gap-3 px-5 py-3.5">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{activity.detail}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/80">{activity.time}</p>
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
