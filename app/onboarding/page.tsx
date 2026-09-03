"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Plus,
  Rocket,
  Search,
} from "lucide-react"
import { targetRoles, allSkills } from "@/lib/mock-data"
import { saveOnboarding } from "@/app/onboarding/actions"
import { SkilloraMark } from "@/components/skillora-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const statusOptions = [
  { value: "student", label: "Student" },
  { value: "working_professional", label: "Working Professional" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "other", label: "Other" },
]

const roleSuggestions = [
  "Backend Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "Cloud Engineer",
  ...targetRoles.map((r) => r.title),
]

const uniqueRoles = Array.from(new Set(roleSuggestions))

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState("")
  const [roleQuery, setRoleQuery] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase()
    if (!q) return uniqueRoles.slice(0, 6)
    return uniqueRoles.filter((r) => r.toLowerCase().includes(q)).slice(0, 6)
  }, [roleQuery])

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    )
  }

  const addCustomSkill = () => {
    const value = skillInput.trim()
    if (value && !skills.includes(value)) {
      setSkills((prev) => [...prev, value])
    }
    setSkillInput("")
  }

  const canContinue =
    (step === 1) ||
    (step === 2 && userType) ||
    (step === 3 && targetRole) ||
    step === 4

  const handleFinish = async () => {
    setSaving(true)
    setError(null)
    const result = await saveOnboarding({ userType, targetRole, skills })
    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }
    router.push("/assessment")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Top brand bar */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <SkilloraMark className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Skillora</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </p>
      </header>

      {/* Progress */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-10">
        {step === 1 && (
          <div className="my-auto text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="size-7" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground text-balance">
              Welcome to Skillora
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Let&apos;s understand where you are and where you want to go. This
              takes less than a minute.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              What are you currently doing?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This helps us tailor your roadmap.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {statusOptions.map((opt) => {
                const active = userType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUserType(opt.value)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-ring hover:bg-secondary",
                    )}
                  >
                    {opt.label}
                    {active && <Check className="size-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              What role are you targeting?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Search or pick a role to aim for.
            </p>
            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="e.g. Backend Engineer"
                value={roleQuery || targetRole}
                onChange={(e) => {
                  setRoleQuery(e.target.value)
                  setTargetRole(e.target.value)
                }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredRoles.map((role) => {
                const active = targetRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role)
                      setRoleQuery("")
                    }}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-ring hover:bg-secondary",
                    )}
                  >
                    {role}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Which skills do you already have?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Select what applies or add your own. You can refine this later.
            </p>
            <div className="mt-6 flex gap-2">
              <Input
                placeholder="Add a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    e.preventDefault()
                    addCustomSkill()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomSkill}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(new Set([...allSkills, ...skills])).map((skill) => {
                const active = skills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-success bg-success-muted text-success"
                        : "border-border bg-card text-foreground hover:border-ring hover:bg-secondary",
                    )}
                  >
                    {active && <Check className="size-3.5" />}
                    {skill}
                  </button>
                )
              })}
            </div>
            {skills.length > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                {skills.length} skill{skills.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Controls */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
            >
              {step === 1 ? "Get started" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleFinish} disabled={saving}>
              <Rocket className="size-4" />
              {saving ? "Saving..." : "Start Skill Assessment"}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
