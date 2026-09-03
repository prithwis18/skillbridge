"use client"

// -----------------------------------------------------------------------------
// PROTOTYPE AUTH SESSION
// -----------------------------------------------------------------------------
// This is a lightweight client-side session used for the SIH demo while the
// backend is being wired up. It intentionally mirrors the shape of a Supabase
// Auth session so it can be swapped for `@supabase/ssr` with minimal changes:
//   - `signUp`  -> supabase.auth.signUp
//   - `signIn`  -> supabase.auth.signInWithPassword
//   - `signOut` -> supabase.auth.signOut
//   - profile   -> a `profiles` row (id, name, email, user_type, target_role)
// Passwords are NEVER stored here — Supabase Auth will own credentials.
// -----------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react"
import { user as demoUser, type UserType } from "@/lib/mock-data"

export type SessionUser = {
  name: string
  email: string
  initials: string
  userType: UserType
  userTypeLabel: string
  targetRole: string | null
  skills: string[]
  onboarded: boolean
  isDemo: boolean
}

type AuthContextValue = {
  user: SessionUser | null
  loading: boolean
  signUp: (data: { name: string; email: string; userType: UserType }) => void
  signIn: (email: string) => void
  signInDemo: () => void
  signOut: () => void
  completeOnboarding: (data: { userType: UserType; targetRole: string; skills: string[] }) => void
  updateProfile: (data: Partial<Pick<SessionUser, "userType" | "userTypeLabel" | "targetRole" | "skills">>) => void
}

const STORAGE_KEY = "skillora.session"

const AuthContext = createContext<AuthContextValue | null>(null)

const userTypeLabels: Record<UserType, string> = {
  student: "Student",
  job_seeker: "Job Seeker",
  working_professional: "Working Professional",
  other: "Other",
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  )
}

function persist(u: SessionUser | null) {
  if (typeof window === "undefined") return
  if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  else window.localStorage.removeItem(STORAGE_KEY)
}

const demoSession: SessionUser = {
  name: demoUser.name,
  email: demoUser.email,
  initials: demoUser.initials,
  userType: demoUser.userType,
  userTypeLabel: demoUser.userTypeLabel,
  targetRole: demoUser.targetRole,
  skills: ["Python", "SQL", "Git", "DSA", "REST APIs", "PostgreSQL", "Linux", "OOP"],
  onboarded: true,
  isDemo: true,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw) as SessionUser)
    } catch {
      // ignore corrupt session
    }
    setLoading(false)
  }, [])

  const update = (next: SessionUser | null) => {
    setUser(next)
    persist(next)
  }

  const value: AuthContextValue = {
    user,
    loading,
    signUp: ({ name, email, userType }) => {
      update({
        name,
        email,
        initials: initials(name),
        userType,
        userTypeLabel: userTypeLabels[userType],
        targetRole: null,
        skills: [],
        onboarded: false,
        isDemo: false,
      })
    },
    signIn: (email) => {
      // Prototype: any known/entered email resumes the demo profile so the
      // judge always lands on a populated dashboard.
      update({ ...demoSession, email: email || demoSession.email, isDemo: false })
    },
    signInDemo: () => update({ ...demoSession }),
    signOut: () => update(null),
    completeOnboarding: ({ userType, targetRole, skills }) => {
      setUser((prev) => {
        const base = prev ?? demoSession
        const next: SessionUser = {
          ...base,
          userType,
          userTypeLabel: userTypeLabels[userType],
          targetRole,
          skills,
          onboarded: true,
        }
        persist(next)
        return next
      })
    },
    updateProfile: (data) => {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...data }
        persist(next)
        return next
      })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
