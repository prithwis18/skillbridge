import OpenAI from "openai"
import { NextResponse } from "next/server"

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const message = body.message
    const profile = body.profile ?? {}

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const prompt = `
You are SkillBridge Help, a friendly AI career and learning assistant.

Help the user with:
- Career guidance
- Skill development
- Learning roadmaps
- Programming questions
- Interview preparation
- Resume and project advice
- SkillBridge platform guidance

User profile:
Name: ${profile.name || "Not provided"}
Education: ${profile.education || "Not provided"}
Institution: ${profile.institution || "Not provided"}
Skills: ${profile.skills || "Not provided"}
Career goal: ${profile.career || "Not provided"}

User's question:
${message}

Give a useful, clear and personalized answer.
`

    const response = await groq.responses.create({
      model: "openai/gpt-oss-20b",
      input: prompt,
    })

    return NextResponse.json({
      reply: response.output_text,
    })
  } catch (error) {
    console.error("AI ERROR:", error)

    return NextResponse.json(
      { error: "AI service is temporarily unavailable." },
      { status: 500 }
    )
  }
}