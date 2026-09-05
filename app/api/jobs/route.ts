import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

type Job = {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  description: string
  url: string
  source: string
  tags: string[]
  match: number
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function calculateMatch(
  title: string,
  description: string,
  tags: string[],
  targetRole: string,
  skills: string[]
) {
  const text = normalize(
    `${title} ${description} ${tags.join(" ")}`
  )

  const role = normalize(targetRole)

  let skillMatches = 0

  for (const skill of skills) {
    const normalizedSkill = normalize(skill)

    if (normalizedSkill && text.includes(normalizedSkill)) {
      skillMatches++
    }
  }

  const skillScore = skills.length
    ? (skillMatches / skills.length) * 70
    : 0

  const roleScore =
    role &&
    (normalize(title).includes(role) ||
      role.includes(normalize(title)))
      ? 30
      : 0

  return Math.min(100, Math.round(skillScore + roleScore))
}

async function fetchArbeitnow() {
  try {
    const response = await fetch(
      "https://www.arbeitnow.com/api/job-board-api",
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 900,
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    return Array.isArray(data.data) ? data.data : []
  } catch {
    return []
  }
}

async function fetchRemotive() {
  try {
    const response = await fetch(
      "https://remotive.com/api/remote-jobs",
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 1800,
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    return Array.isArray(data.jobs) ? data.jobs : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("target_role, skills")
        .eq("id", user.id)
        .single()

    if (profileError) {
      console.error("Job profile error:", profileError)
    }

    const targetRole =
      profile?.target_role?.trim() || "Software Engineer"

    let skills: string[] = []

    if (Array.isArray(profile?.skills)) {
      skills = profile.skills
        .map((skill: unknown) => String(skill).trim())
        .filter(Boolean)
    } else if (typeof profile?.skills === "string") {
      skills = profile.skills
        .split(",")
        .map((skill: string) => skill.trim())
        .filter(Boolean)
    }

    const [arbeitnowJobs, remotiveJobs] =
      await Promise.all([
        fetchArbeitnow(),
        fetchRemotive(),
      ])

    const jobs: Job[] = []

    for (const job of arbeitnowJobs) {
      const title = String(job.title ?? "")
      const description = String(job.description ?? "")
      const tags = Array.isArray(job.tags)
        ? job.tags.map((tag: unknown) => String(tag))
        : []

      if (!title) continue

      jobs.push({
        id: `arbeitnow-${job.slug ?? job.id ?? Math.random()}`,
        title,
        company: String(job.company_name ?? "Unknown Company"),
        location: String(job.location ?? "Remote"),
        remote: Boolean(job.remote),
        description,
        url: String(job.url ?? ""),
        source: "Arbeitnow",
        tags,
        match: calculateMatch(
          title,
          description,
          tags,
          targetRole,
          skills
        ),
      })
    }

    for (const job of remotiveJobs) {
      const title = String(job.title ?? "")
      const description = String(job.description ?? "")
      const tags = Array.isArray(job.tags)
        ? job.tags.map((tag: unknown) => String(tag))
        : []

      if (!title) continue

      jobs.push({
        id: `remotive-${job.id ?? Math.random()}`,
        title,
        company: String(job.company_name ?? "Unknown Company"),
        location: String(job.candidate_required_location ?? "Remote"),
        remote: true,
        description,
        url: String(job.url ?? ""),
        source: "Remotive",
        tags,
        match: calculateMatch(
          title,
          description,
          tags,
          targetRole,
          skills
        ),
      })
    }

    const uniqueJobs = Array.from(
      new Map(
        jobs
          .filter((job) => job.url)
          .map((job) => [job.url, job])
      ).values()
    )

    uniqueJobs.sort((a, b) => b.match - a.match)

    return NextResponse.json({
      userId: user.id,
      targetRole,
      skills,
      jobs: uniqueJobs.slice(0, 60),
      total: uniqueJobs.length,
      generatedAt: new Date().toISOString(),
      freshness:
        "Jobs are fetched dynamically; freshness depends on the public provider.",
    })
  } catch (error) {
    console.error("Jobs API error:", error)

    return NextResponse.json(
      { error: "Unable to load jobs" },
      { status: 500 }
    )
  }
}
