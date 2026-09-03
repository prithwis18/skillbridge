"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { jobs, user } from "@/lib/mock-data"
import { PageHeader } from "@/components/page-header"
import { JobCard } from "@/components/job-card"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

type Filter = "all" | "ready" | "stretch"

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All roles" },
  { id: "ready", label: "Ready (75%+)" },
  { id: "stretch", label: "Stretch roles" },
]

export default function JobsPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")

  const visibleJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (filter === "ready") return job.readiness >= 75
        if (filter === "stretch") return job.readiness < 75
        return true
      })
      .filter((job) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => b.readiness - a.readiness)
  }, [filter, query])

  return (
    <div>
      <PageHeader
        title="Job Recommendations"
        description={`AI-matched roles ranked by your readiness for ${user.targetRole}.`}
        action={<StatusBadge tone="primary">{jobs.length} matches</StatusBadge>}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, company, skill..."
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visibleJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">No roles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or filter.
          </p>
        </div>
      )}
    </div>
  )
}
