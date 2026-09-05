"use client"

import { useEffect, useState } from "react"
import { ReadinessRing } from "@/components/readiness-ring"

export function DynamicReadiness({ fallback = 68 }: { fallback?: number }) {
  const [readiness, setReadiness] = useState(fallback)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillbridge-assessment-result")

      if (saved) {
        const result = JSON.parse(saved)

        if (typeof result.readiness === "number") {
          setReadiness(result.readiness)
        }
      }
    } catch {
      // Keep fallback if saved data is invalid
    }
  }, [])

  return <ReadinessRing value={readiness} size={150} />
}
