const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_MODEL = "openai/gpt-oss-20b"

type GroqResult = {
  text: string
  keyIndex: number
  model: string
}

type KeyState = {
  unavailableUntil: number
}

const states: KeyState[] = [
  { unavailableUntil: 0 },
  { unavailableUntil: 0 },
]

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1?.trim() || "",
    process.env.GROQ_API_KEY_2?.trim() || "",
  ].filter(Boolean)
}

function getModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL
}

function retryDelay(response: Response): number {
  const retryAfter = response.headers.get("retry-after")
  const reset = response.headers.get("x-ratelimit-reset-tokens")

  if (retryAfter) {
    const seconds = Number.parseFloat(retryAfter)
    if (Number.isFinite(seconds)) {
      return Math.min(Math.max(seconds * 1000, 1000), 120000)
    }
  }

  if (reset) {
    const match = reset.match(/([\d.]+)(ms|s|m|h)/i)
    if (match) {
      const value = Number.parseFloat(match[1])
      const unit = match[2].toLowerCase()

      if (Number.isFinite(value)) {
        const multiplier =
          unit === "ms" ? 1 :
          unit === "s" ? 1000 :
          unit === "m" ? 60000 :
          3600000

        return Math.min(Math.max(value * multiplier, 1000), 120000)
      }
    }
  }

  return 30000
}

function shouldFailover(status: number): boolean {
  return status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
}

function extractText(data: any): string {
  if (typeof data?.choices?.[0]?.message?.content === "string") {
    return data.choices[0].message.content.trim()
  }

  if (typeof data?.output_text === "string") {
    return data.output_text.trim()
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = []

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string") {
            parts.push(content.text)
          }
        }
      }
    }

    return parts.join("\n").trim()
  }

  return ""
}

async function callKey(
  key: string,
  keyIndex: number,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<GroqResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2048,
      }),
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      const error = new Error(
        `Groq ${response.status}: ${body.slice(0, 500)}`
      ) as Error & { status?: number; retryMs?: number }

      error.status = response.status

      if (shouldFailover(response.status)) {
        error.retryMs = retryDelay(response)
      }

      throw error
    }

    const data = await response.json()
    const text = extractText(data)

    if (!text) {
      throw new Error("Groq returned an empty response")
    }

    return {
      text,
      keyIndex,
      model: getModel(),
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function groqChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<GroqResult | null> {
  const keys = getKeys()

  if (keys.length === 0) {
    return null
  }

  const now = Date.now()

  for (let offset = 0; offset < keys.length; offset++) {
    const index = offset
    const key = keys[index]

    if (!key) continue
    if (states[index].unavailableUntil > now) continue

    try {
      const result = await callKey(key, index, messages, options)

      states[index].unavailableUntil = 0

      return result
    } catch (error) {
      const typed = error as Error & {
        status?: number
        retryMs?: number
      }

      if (typed.status === 401 || typed.status === 403) {
        states[index].unavailableUntil = Date.now() + 5 * 60 * 1000
      } else if (typed.retryMs) {
        states[index].unavailableUntil = Date.now() + typed.retryMs
      } else {
        states[index].unavailableUntil = Date.now() + 15000
      }
    }
  }

  return null
}

export async function groqJSON<T>(
  system: string,
  user: string,
  fallback: T
): Promise<T> {
  const result = await groqChat(
    [
      {
        role: "system",
        content:
          system +
          "\nReturn ONLY valid JSON. Do not use markdown fences.",
      },
      {
        role: "user",
        content: user,
      },
    ],
    {
      temperature: 0.1,
      maxTokens: 3000,
    }
  )

  if (!result) {
    return fallback
  }

  try {
    const cleaned = result.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

export function aiAvailable(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY_1?.trim() ||
    process.env.GROQ_API_KEY_2?.trim()
  )
}
