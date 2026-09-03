"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkilloraLogo } from "@/components/skillora-logo"
import { SkillBadge } from "@/components/skill-badge"
import { useProfile } from "@/lib/profile-context"
import { targetRoles, skillPool } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, completeOnboarding } = useProfile()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState(targetRoles[0])
  const [skills, setSkills] = useState<string[]>([])

  function toggleSkill(name: string) {
    setSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    )
  }

  function finish() {
    completeOnboarding({ targetRole: role, skills, userType: profile.userType })
    router.push("/")
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SkilloraLogo className="size-5" />
        </div>
        <span className="text-lg font-semibold text-foreground">Skillora</span>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {["Target role", "Your skills"].map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                i <= step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i === 0 && <span className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            What role are you working toward?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll benchmark your skills against this role&apos;s real requirements.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {targetRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  "flex items-center justify-between rounded-md border p-4 text-left text-sm font-medium transition-colors",
                  role === r
                    ? "border-primary bg-accent text-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                {r}
                {role === r && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep(1)}>
              Next
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Which of these can you do today?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select every skill you have some working experience with. You can refine
            proficiency later in the assessment.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {skillPool.map((s) => (
              <SkillBadge
                key={s}
                name={s}
                selectable
                selected={skills.includes(s)}
                onClick={() => toggleSkill(s)}
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {skills.length} selected
          </p>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={finish}>
              Build my dashboard
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
