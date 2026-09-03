"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Rocket,
  Compass,
  Target,
  Layers,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  targetRoles,
  allSkills,
  userTypes,
  type UserType,
} from "@/lib/mock-data"
import { LogoMark } from "@/components/logo"
import { SkillBadge } from "@/components/skill-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>(user?.userType ?? "student")
  const [role, setRole] = useState<string | null>(user?.targetRole ?? null)
  const [roleQuery, setRoleQuery] = useState("")
  const [skills, setSkills] = useState<string[]>(user?.skills ?? [])

  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase()
    if (!q) return targetRoles
    return targetRoles.filter((r) => r.title.toLowerCase().includes(q))
  }, [roleQuery])

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const canContinue =
    (step === 1) ||
    (step === 2 && userType) ||
    (step === 3 && role) ||
    (step === 4 && skills.length > 0)

  const finish = () => {
    if (!role) return
    completeOnboarding({ userType, targetRole: role, skills })
    router.replace("/assessment")
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary p-1.5 text-primary-foreground">
            <LogoMark />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Skillora</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex-1">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-accent text-primary">
              <Compass className="size-7" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground text-balance">
              Welcome to Skillora{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground text-pretty">
              Let&apos;s understand where you are and where you want to go. This takes less than
              a minute and personalizes everything that follows.
            </p>
          </div>
        )}

        {/* Step 2: Current status */}
        {step === 2 && (
          <div>
            <StepHeading
              icon={Target}
              title="What are you currently doing?"
              subtitle="This helps us calibrate your roadmap and job matches."
            />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {userTypes.map((t) => {
                const selected = userType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setUserType(t.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 text-left text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50",
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Target role */}
        {step === 3 && (
          <div>
            <StepHeading
              icon={Target}
              title="What role are you targeting?"
              subtitle="Search or pick a role. We'll benchmark your skills against it."
            />
            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                placeholder="Search roles (e.g. Backend Engineer)"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredRoles.map((r) => {
                const selected = role === r.title
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.title)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-accent ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.demand} demand</p>
                    </div>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                )
              })}
              {filteredRoles.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                  No roles match &ldquo;{roleQuery}&rdquo;.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Skills */}
        {step === 4 && (
          <div>
            <StepHeading
              icon={Layers}
              title="Which skills do you already have?"
              subtitle="Select all that apply. You can refine these anytime."
            />
            <div className="mt-6 flex flex-wrap gap-2.5">
              {allSkills.map((s) => (
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
              {skills.length} skill{skills.length === 1 ? "" : "s"} selected
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))} disabled={!canContinue}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={finish} disabled={!canContinue}>
            <Rocket className="size-4" />
            Start Skill Assessment
          </Button>
        )}
      </div>
    </div>
  )
}

function StepHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{subtitle}</p>
      </div>
    </div>
  )
}
