import { NextResponse } from "next/server"
import { groqJSON } from "@/lib/ai/groq"

type Profile = {
  name?: string
  target_role?: string
  skills?: unknown
  experience_level?: string
}

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map(s => s.trim()).filter(Boolean)
  }

  if (typeof value === "string") {
    return value.split(",").map(s => s.trim()).filter(Boolean)
  }

  return []
}

function fallbackAnalysis(profile: Profile) {
  const role = profile.target_role?.trim() || "Software Developer"
  const skills = normalizeSkills(profile.skills)

  const common = [
    "Data Structures & Algorithms",
    "Git",
    "SQL",
    "REST APIs",
    "Testing",
    "System Design",
  ]

  const gaps = common.filter(
    skill => !skills.some(
      s => s.toLowerCase() === skill.toLowerCase()
    )
  )

  const readiness = Math.max(
    20,
    Math.min(
      95,
      35 +
        Math.min(skills.length * 6, 36) +
        (profile.experience_level === "Advanced"
          ? 20
          : profile.experience_level === "Intermediate"
            ? 12
            : 5)
    )
  )

  return {
    aiAvailable: false,
    targetRole: role,
    readiness,
    summary: `Based on your current profile, you have a foundation for ${role}. Focus on the highest-priority missing skills and practical projects.`,
    strengths: skills.slice(0, 5),
    gaps: gaps.slice(0, 6),
    prioritySkills: gaps.slice(0, 5),
    roadmap: gaps.slice(0, 5).map((skill, index) => ({
      order: index + 1,
      skill,
      reason: `Build ${skill} knowledge for your ${role} target.`,
    })),
    jobFit: {
      score: readiness,
      explanation: `Your current profile has a ${readiness}% estimated baseline fit for ${role}.`,
    },
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const profile: Profile = body?.profile || {}

    const role = profile.target_role?.trim() || "Software Developer"
    const skills = normalizeSkills(profile.skills)

    const prompt = `
You are the career intelligence engine for SkillBridge.

Analyze this candidate for their target role.

TARGET ROLE:
${role}

CURRENT SKILLS:
${skills.length ? skills.join(", ") : "No skills provided"}

EXPERIENCE:
${profile.experience_level || "Not specified"}

Return ONLY valid JSON using exactly this structure:

{
  "targetRole": "string",
  "readiness": 0,
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "prioritySkills": ["string"],
  "roadmap": [
    {
      "order": 1,
      "skill": "string",
      "reason": "string"
    }
  ],
  "jobFit": {
    "score": 0,
    "explanation": "string"
  }
}

Rules:
- readiness must be 0-100
- jobFit.score must be 0-100
- identify realistic role-specific gaps
- do not invent candidate skills
- roadmap should contain 4-6 priorities
- prioritize practical employability
- keep summary concise
`

    const result = await groqJSON(prompt)

    return NextResponse.json({
      aiAvailable: true,
      ...result,
    })
  } catch (error) {
    console.error("Career AI failed, using fallback:", error)

    return NextResponse.json(
      fallbackAnalysis(
        (() => {
          try {
            return {}
          } catch {
            return {}
          }
        })()
      ),
      { status: 200 }
    )
  }
}
