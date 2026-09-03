"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AuthLayout } from "@/components/auth-layout"
import { userTypes, type UserType } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<UserType | null>(null)

  const canSubmit = name.trim() && email.trim() && password.length >= 6 && userType

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !userType) return
    signUp({ name: name.trim(), email: email.trim(), userType })
    router.replace("/onboarding")
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Build the right skills. Become ready for the right opportunity."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav Sharma"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">
            What best describes you?
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {userTypes.map((t) => {
              const selected = userType === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setUserType(t.value)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50",
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
          Create Account
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
