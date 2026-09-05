import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { groqJSON, groqChat } from "@/lib/ai/groq"

export const dynamic = "force-dynamic"

type AnalysisInput = {
  role?: string
  skills?: string[]
  experience?: string
  jobs?: Array<{
    title?: string
    description?: string
    matchedSkills?: string[]
  }>
  assessment?: Record<string, unknown>
}

type Analysis = {
  summary: string
  readiness: number
  strengths: string[]
  gaps: string[]
  prioritySkills: string[]
  roadmap: Array<{
    skill: string
    priority: "high" | "medium" | "low"
    reason: string
  }>
  jobFit: string
}

const fallback: Analysis = {
  summary: "Your profile is being analyzed using your current skills and target role.",
  readiness: 0,
  strengths: [],
  gaps: [],
  prioritySkills: [],
  roadmap: [],
  jobFit: "Analysis will update when AI service is available.",
}

function normalizeNumber(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 20)
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized", fallback },
        { status: 401 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as AnalysisInput

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role, skills, experience_level")
      .eq("id", user.id)
      .maybeSingle()

    const role =
      body.role?.trim() ||
      String(profile?.target_role || "").trim()

    const rawSkills =
      body.skills ||
      (Array.isArray(profile?.skills)
        ? profile.skills.map(String)
        : typeof profile?.skills === "string"
          ? profile.skills.split(",")
          : [])

    const skills = Array.from(
      new Set(
        rawSkills
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      )
    ).slice(0, 30)

    const experience =
      body.experience ||
      String(profile?.experience_level || "Not specified")

    const jobs = Array.isArray(body.jobs)
      ? body.jobs.slice(0, 15).map((job) => ({
          title: String(job.title || ""),
          description: String(job.description || "").slice(0, 1500),
          matchedSkills: Array.isArray(job.matchedSkills)
            ? job.matchedSkills.map(String).slice(0, 15)
            : [],
        }))
      : []

    const prompt = `
Analyze this SkillBridge candidate.

TARGET ROLE:
${role || "Not specified"}

CURRENT SKILLS:
${skills.join(", ") || "None"}

EXPERIENCE:
${experience}

CURRENT JOB MARKET DATA:
${JSON.stringify(jobs)}

Return JSON with exactly:
{
  "summary": "short practical summary",
  "readiness": 0,
  "strengths": ["skill"],
  "gaps": ["skill"],
  "prioritySkills": ["skill"],
  "roadmap": [
    {
      "skill": "skill",
      "priority": "high",
      "reason": "why this matters"
    }
  ],
  "jobFit": "short explanation"
}

Rules:
- readiness must be 0-100
- do not invent skills the candidate has
- distinguish current skills from missing skills
- prioritize skills appearing in the supplied job data
- roadmap should contain 3-8 items
- strengths and gaps should be practical
- do not recommend unrelated technologies
`

    const analysis = await groqJSON<Analysis>(
      "You are SkillBridge's career intelligence engine. Be accurate, practical and conservative.",
      prompt,
      {
        ...fallback,
        summary:
          role && skills.length
            ? `Your profile targets ${role} with ${skills.length} recorded skills.`
            : fallback.summary,
        readiness: skills.length ? Math.min(90, skills.length * 8) : 0,
        strengths: skills.slice(0, 5),
        gaps: [],
        prioritySkills: [],
        roadmap: [],
      }
    )

    const normalized: Analysis = {
      summary:
        typeof analysis.summary === "string"
          ? analysis.summary
          : fallback.summary,

      readiness: normalizeNumber(analysis.readiness),

      strengths: normalizeStringArray(analysis.strengths),

      gaps: normalizeStringArray(analysis.gaps),

      prioritySkills: normalizeStringArray(analysis.prioritySkills),

      roadmap: Array.isArray(analysis.roadmap)
        ? analysis.roadmap
            .map((item) => ({
              skill: String(item?.skill || "").trim(),
              priority:
                item?.priority === "high" ||
                item?.priority === "low"
                  ? item.priority
                  : "medium",
              reason: String(item?.reason || "").trim(),
            }))
            .filter((item) => item.skill)
            .slice(0, 10)
        : [],

      jobFit:
        typeof analysis.jobFit === "string"
          ? analysis.jobFit
          : fallback.jobFit,
    }

    return NextResponse.json({
      ok: true,
      ai: true,
      model: "openai/gpt-oss-20b",
      analysis: normalized,
    })
  } catch (error) {
    console.error("SkillBridge AI analysis error:", error)

    return NextResponse.json({
      ok: false,
      ai: false,
      analysis: fallback,
      error: "AI unavailable; existing SkillBridge logic should continue.",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "SkillBridge Groq AI",
    model: "openai/gpt-oss-20b",
  })
}
