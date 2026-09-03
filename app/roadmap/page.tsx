import { Check, Circle, Loader2, BookOpen } from "lucide-react"
import { roadmap, courses, user, type RoadmapPhase } from "@/lib/mock-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card"
import { PageHeader } from "@/components/page-header"
import { ProgressBar } from "@/components/progress-bar"
import { StatusBadge } from "@/components/status-badge"
import { CourseCard } from "@/components/course-card"
import { SkillBadge } from "@/components/skill-badge"
import { cn } from "@/lib/utils"

function phaseMeta(status: RoadmapPhase["status"]) {
  switch (status) {
    case "completed":
      return {
        icon: Check,
        dot: "border-success bg-success text-success-foreground",
        tone: "success" as const,
        label: "Completed",
      }
    case "active":
      return {
        icon: Loader2,
        dot: "border-primary bg-primary text-primary-foreground",
        tone: "primary" as const,
        label: "In Progress",
      }
    default:
      return {
        icon: Circle,
        dot: "border-border bg-card text-muted-foreground",
        tone: "neutral" as const,
        label: "Upcoming",
      }
  }
}

export default function RoadmapPage() {
  const activeCourses = courses.filter((c) => c.progress > 0)

  return (
    <div>
      <PageHeader
        title="Learning Roadmap"
        description={`A personalized path to become a job-ready ${user.targetRole}.`}
        action={
          <StatusBadge tone="primary">{user.learningProgress}% complete</StatusBadge>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <ProgressBar
            value={user.learningProgress}
            tone="primary"
            label="Overall roadmap progress"
            showLabel
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-success" /> Completed phase
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" /> Active phase
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-border" /> Upcoming phase
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="relative pl-2">
            <ol className="relative border-l-2 border-border">
              {roadmap.map((phase) => {
                const meta = phaseMeta(phase.status)
                const Icon = meta.icon
                return (
                  <li key={phase.id} className="mb-6 ml-6 last:mb-0">
                    <span
                      className={cn(
                        "absolute -left-4.5 flex size-8 items-center justify-center rounded-full border-2",
                        meta.dot,
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          phase.status === "active" && "animate-spin",
                        )}
                      />
                    </span>
                    <Card
                      className={cn(
                        phase.status === "active" && "border-primary/30 ring-1 ring-primary/15",
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              {phase.duration}
                            </p>
                            <h3 className="mt-0.5 text-base font-semibold text-foreground">
                              {phase.title}
                            </h3>
                          </div>
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground text-pretty">
                          {phase.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {phase.skills.map((s) => (
                            <SkillBadge key={s} name={s} />
                          ))}
                        </div>
                        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                          {phase.courses.map((c) => (
                            <p
                              key={c}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <BookOpen className="size-3.5 text-primary" />
                              {c}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        {/* Active courses */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Continue Learning
          </h2>
          <div className="space-y-4">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommended courses */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Recommended Courses
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses
            .filter((c) => c.progress === 0)
            .map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
        </div>
      </div>
    </div>
  )
}
