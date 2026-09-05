"use client"

import { useState } from "react"

export default function AIPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Hi! I'm your SkillBridge AI Career Assistant. Ask me anything about skills, careers, learning paths, or interview preparation.",
    },
  ])

  const sendMessage = () => {
    if (!message.trim()) return

    const userMessage = message.trim()

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      {
        role: "ai",
        text: "I'm ready to help! AI connection will be added next.",
      },
    ])

    setMessage("")
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          SkillBridge AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personal AI career and skill assistant.
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  item.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="Ask SkillBridge AI..."
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              onClick={sendMessage}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
