"use client"

import { useEffect, useState } from "react"
import {
  User,
  BriefcaseBusiness,
  Pencil,
  LogOut,
  Mail,
  Target,
  GraduationCap,
  MapPin,
  Clock3,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import { EditProfile } from "@/components/account/edit-profile"

type Profile = {
  name?: string | null
  target_role?: string | null
}

type Preferences = {
  experienceLevel: string
  careerGoal: string
  jobType: string
  preferredLocation: string
  weeklyHours: string
  learningStyle: string
}

const defaultPreferences: Preferences = {
  experienceLevel: "",
  careerGoal: "",
  jobType: "",
  preferredLocation: "",
  weeklyHours: "",
  learningStyle: "",
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile>({})
  const [email, setEmail] = useState("")
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences)

  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setEmail(user.email ?? "")

      const { data } = await supabase
        .from("profiles")
        .select("name,target_role")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
      }

      const savedPreferences = localStorage.getItem(
        "skillbridge_account_preferences"
      )

      if (savedPreferences) {
        try {
          setPreferences({
            ...defaultPreferences,
            ...JSON.parse(savedPreferences),
          })
        } catch {
          setPreferences(defaultPreferences)
        }
      }

      setLoading(false)
    }

    loadAccount()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const name = profile.name || "Toufik"

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading account information...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Account Information
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal, career and learning information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Pencil className="size-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{name}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.target_role || "Career goal not set"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {preferences.experienceLevel && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {preferences.experienceLevel}
                </span>
              )}

              {preferences.jobType && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {preferences.jobType}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Information */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <User className="size-5 text-primary" />
          <h2 className="font-semibold">Personal Information</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4" />
              <span className="text-xs">Full Name</span>
            </div>

            <p className="mt-2 font-medium">
              {name}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              <span className="text-xs">Email Address</span>
            </div>

            <p className="mt-2 break-all font-medium">
              {email || "Not available"}
            </p>
          </div>
        </div>
      </section>

      {/* Career Information */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <BriefcaseBusiness className="size-5 text-primary" />
          <h2 className="font-semibold">Career Information</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="size-4" />
              <span className="text-xs">Target Role</span>
            </div>

            <p className="mt-2 font-medium">
              {profile.target_role || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="size-4" />
              <span className="text-xs">Experience Level</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.experienceLevel || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BriefcaseBusiness className="size-4" />
              <span className="text-xs">Preferred Job Type</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.jobType || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span className="text-xs">Preferred Location</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.preferredLocation || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="size-4" />
              <span className="text-xs">Career Goal</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.careerGoal || "Not set"}
            </p>
          </div>
        </div>
      </section>

      {/* Learning Preferences */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="font-semibold">Learning Preferences</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="size-4" />
              <span className="text-xs">Weekly Learning Hours</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.weeklyHours || "Not set"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span className="text-xs">Learning Style</span>
            </div>

            <p className="mt-2 font-medium">
              {preferences.learningStyle || "Not set"}
            </p>
          </div>
        </div>
      </section>

      {/* Profile Status */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="font-semibold">Profile Status</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <CheckCircle2 className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Account Active</p>
              <p className="text-xs text-muted-foreground">
                Your account is active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Mail className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Email Connected</p>
              <p className="text-xs text-muted-foreground">
                Authentication enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <User className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Profile Available</p>
              <p className="text-xs text-muted-foreground">
                Personal information loaded
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold">Account Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your current SkillBridge session.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </section>

      {editing && (
        <EditProfile
          profile={profile}
          preferences={preferences}
          onClose={() => setEditing(false)}
          onSaved={(updatedProfile, updatedPreferences) => {
            setProfile(updatedProfile)
            setPreferences(updatedPreferences)
          }}
        />
      )}
    </div>
  )
}

