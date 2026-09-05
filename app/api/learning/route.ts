import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

type Resource = {
  id: string
  title: string
  description: string
  type: "video" | "github" | "documentation"
  url: string
  source: string
  skill: string
  free: boolean
}

function cleanSkill(value: string) {
  return value
    .replace(/[^\w\s.+#-]/g, "")
    .trim()
}

function docsForSkill(skill: string): Resource[] {
  const encoded = encodeURIComponent(skill)

  const docs: Record<string, string> = {
    Python: "https://docs.python.org/3/",
    JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    TypeScript: "https://www.typescriptlang.org/docs/",
    React: "https://react.dev/learn",
    "Next.js": "https://nextjs.org/docs",
    "Node.js": "https://nodejs.org/docs/latest/api/",
    SQL: "https://www.postgresql.org/docs/",
    PostgreSQL: "https://www.postgresql.org/docs/",
    MongoDB: "https://www.mongodb.com/docs/",
    Git: "https://git-scm.com/doc",
    Docker: "https://docs.docker.com/get-started/",
    AWS: "https://docs.aws.amazon.com/",
    DSA: "https://www.geeksforgeeks.org/dsa/",
    "REST APIs": "https://developer.mozilla.org/en-US/docs/Glossary/REST",
    "Machine Learning": "https://scikit-learn.org/stable/user_guide.html",
    Linux: "https://www.linux.org/pages/download/",
  }

  return [
    {
      id: `docs-${encoded}`,
      title: `${skill} Official Documentation`,
      description: `Official documentation and learning material for ${skill}.`,
      type: "documentation",
      url:
        docs[skill] ??
        `https://www.google.com/search?q=${encoded}+official+documentation`,
      source: "Official Documentation",
      skill,
      free: true,
    },
  ]
}

async function githubForSkill(skill: string): Promise<Resource[]> {
  try {
    const query = encodeURIComponent(`${skill} learning tutorial`)

    const response = await fetch(
      `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=6`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "SkillBridge",
        },
        next: { revalidate: 900 },
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    return (data.items ?? []).slice(0, 6).map((repo: any) => ({
      id: `github-${repo.id}`,
      title: repo.full_name,
      description:
        repo.description ??
        `Open-source ${skill} project for practical learning.`,
      type: "github" as const,
      url: repo.html_url,
      source: "GitHub Open Source",
      skill,
      free: true,
    }))
  } catch {
    return []
  }
}

async function youtubeForSkill(skill: string): Promise<Resource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) return []

  try {
    const queries = [
      `${skill} complete course`,
      `${skill} full course`,
      `${skill} tutorial playlist`,
    ]

    const results: Resource[] = []

    for (const searchQuery of queries) {
      const query = encodeURIComponent(searchQuery)

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=3&q=${query}&relevanceLanguage=en&regionCode=IN&key=${apiKey}`,
        {
          next: { revalidate: 900 },
        }
      )

      if (!response.ok) continue

      const data = await response.json()

      for (const item of data.items ?? []) {
        const playlistId = item.id?.playlistId

        if (!playlistId) continue

        results.push({
          id: `youtube-playlist-${playlistId}`,
          title: item.snippet?.title ?? `${skill} YouTube Playlist`,
          description:
            item.snippet?.description ??
            `Public YouTube learning playlist for ${skill}.`,
          type: "video",
          url: `https://www.youtube.com/playlist?list=${playlistId}`,
          source: "YouTube Playlist",
          skill,
          free: true,
        })
      }
    }

    const unique = Array.from(
      new Map(results.map((item) => [item.id, item])).values()
    )

    return unique.slice(0, 8)
  } catch {
    return []
  }
}

async function youtubeVideosForSkill(skill: string): Promise<Resource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) return []

  try {
    const query = encodeURIComponent(`${skill} tutorial`)

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${query}&videoEmbeddable=true&relevanceLanguage=en&regionCode=IN&key=${apiKey}`,
      {
        next: { revalidate: 900 },
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    return (data.items ?? [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => ({
        id: `youtube-video-${item.id.videoId}`,
        title: item.snippet?.title ?? `${skill} Tutorial`,
        description:
          item.snippet?.description ??
          `YouTube tutorial for ${skill}.`,
        type: "video" as const,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        source: "YouTube",
        skill,
        free: true,
      }))
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role, skills")
      .eq("id", user.id)
      .single()

    const targetRole =
      profile?.target_role?.trim() || "Software Engineer"

    const profileSkills =
      typeof profile?.skills === "string"
        ? profile.skills
            .split(",")
            .map((skill: string) => cleanSkill(skill))
            .filter(Boolean)
        : Array.isArray(profile?.skills)
          ? profile.skills
              .map((skill: unknown) => cleanSkill(String(skill)))
              .filter(Boolean)
          : []

    const roleSkills: Record<string, string[]> = {
      "Backend Engineer": [
        "Python",
        "Java",
        "SQL",
        "Git",
        "REST APIs",
        "Docker",
        "AWS",
      ],
      "Frontend Engineer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Git",
      ],
      "Full Stack Developer": [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "SQL",
        "Git",
      ],
      "Data Scientist": [
        "Python",
        "SQL",
        "Machine Learning",
        "Git",
      ],
      "Machine Learning Engineer": [
        "Python",
        "Machine Learning",
        "SQL",
        "Git",
        "Docker",
        "AWS",
      ],
      "DevOps Engineer": [
        "Linux",
        "Git",
        "Docker",
        "AWS",
      ],
    }

    const liveRole = targetRole.trim()

    const liveSkills = profileSkills
      .map((skill) => String(skill).trim())
      .filter(Boolean)

    const skills = Array.from(
      new Set([
        liveRole,
        ...liveSkills,
      ])
    )
      .filter(Boolean)
      .slice(0, 10)
    const resources: Resource[] = []

    for (const skill of skills) {
      const [github, playlists, videos] = await Promise.all([
        githubForSkill(skill),
        youtubeForSkill(skill),
        youtubeVideosForSkill(skill),
      ])

      resources.push(
        ...docsForSkill(skill),
        ...github,
        ...playlists,
        ...videos
      )
    }

    return NextResponse.json({
      userId: user.id,
      targetRole,
      skills,
      resources,
      sources: {
        github: true,
        youtube: Boolean(process.env.YOUTUBE_API_KEY),
        documentation: true,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Learning API error:", error)

    return NextResponse.json(
      { error: "Unable to load learning resources" },
      { status: 500 }
    )
  }
}

