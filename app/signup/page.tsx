"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthHero } from "@/components/auth/auth-hero"
import { useProfile, type UserType } from "@/lib/profile-context"
import { cn } from "@/lib/utils"

const userTypes: { value: UserType; label: string; hint: string }[] = [
  { value: "student", label: "Student", hint: "Studying, preparing for placements" },
  { value: "job_seeker", label: "Job seeker", hint: "Actively looking for a role" },
  { value: "working_professional", label: "Professional", hint: "Upskilling or switching tracks" },
  { value: "other", label: "Other", hint: "Exploring my options" },
]

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useProfile()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userType, setUserType] = useState<UserType>("student")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    signup({ name: name || "New User", email: email || "new@skillora.in", userType })
    router.push("/onboarding")
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              A couple of details and we&apos;ll set up your skill profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">I am a...</span>
              <div className="grid grid-cols-2 gap-2">
                {userTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setUserType(t.value)}
                    aria-pressed={userType === t.value}
                    className={cn(
                      "rounded-md border p-3 text-left transition-colors",
                      userType === t.value
                        ? "border-primary bg-accent"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">{t.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                      {t.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-info hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
