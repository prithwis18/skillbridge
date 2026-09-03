"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { demoProfile } from "@/lib/mock-data"

export type UserType = "student" | "job_seeker" | "working_professional" | "other"

export type Profile = {
  name: string
  email: string
  userType: UserType
  targetRole: string
  skills: string[]
  isDemo: boolean
  onboarded: boolean
}

type ProfileContextValue = {
  profile: Profile
  isAuthed: boolean
  signup: (data: { name: string; email: string; userType: UserType }) => void
  login: (email: string) => void
  logout: () => void
  completeOnboarding: (data: { targetRole: string; skills: string[]; userType: UserType }) => void
  updateProfile: (patch: Partial<Profile>) => void
}

const STORAGE_KEY = "skillora.profile.v1"

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(demoProfile)
  const [isAuthed, setIsAuthed] = useState(false)

  // Rehydrate any simulated session (prototype only — no real backend).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Profile
        setProfile(parsed)
        setIsAuthed(!parsed.isDemo)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function persist(next: Profile, authed: boolean) {
    setProfile(next)
    setIsAuthed(authed)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const value: ProfileContextValue = {
    profile,
    isAuthed,
    signup: ({ name, email, userType }) =>
      persist(
        {
          name,
          email,
          userType,
          targetRole: "",
          skills: [],
          isDemo: false,
          onboarded: false,
        },
        true,
      ),
    login: (email) =>
      // Prototype login: reuse demo intelligence data under the account.
      persist(
        {
          ...demoProfile,
          email,
          isDemo: false,
          onboarded: true,
        },
        true,
      ),
    logout: () => {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      setProfile(demoProfile)
      setIsAuthed(false)
    },
    completeOnboarding: ({ targetRole, skills, userType }) =>
      persist(
        { ...profile, targetRole, skills, userType, onboarded: true },
        true,
      ),
    updateProfile: (patch) => persist({ ...profile, ...patch }, isAuthed),
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
