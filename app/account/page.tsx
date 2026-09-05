"use client"

import { useState } from "react"

export default function AccountPage() {
  const [editing, setEditing] = useState(false)

  const [profile, setProfile] = useState({
    name: "Pratyush",
    email: "pratyush@example.com",
    education: "B.Tech Computer Science & Engineering",
    institution: "Sister Nivedita University",
    skills: "Java, Python, C, Web Development",
    career: "Software Development",
  })

  const update = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Account Information
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal and career information.
          </p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.career}
            </p>

            <div className="mt-5 w-full rounded-xl bg-muted/50 p-4 text-left">
              <p className="text-xs font-medium text-muted-foreground">
                PROFILE STATUS
              </p>
              <p className="mt-1 font-medium">Profile Active</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your basic account details.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name"
              value={profile.name}
              editing={editing}
              onChange={(v) => update("name", v)}
            />

            <Field
              label="Email"
              value={profile.email}
              editing={editing}
              onChange={(v) => update("email", v)}
            />

            <Field
              label="Education"
              value={profile.education}
              editing={editing}
              onChange={(v) => update("education", v)}
            />

            <Field
              label="Institution"
              value={profile.institution}
              editing={editing}
              onChange={(v) => update("institution", v)}
            />

            <Field
              label="Skills"
              value={profile.skills}
              editing={editing}
              onChange={(v) => update("skills", v)}
            />

            <Field
              label="Career Interest"
              value={profile.career}
              editing={editing}
              onChange={(v) => update("career", v)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">SkillBridge Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Information used to personalize your SkillBridge experience.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Assessment</p>
            <p className="mt-1 font-semibold">Not completed</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Skills Added</p>
            <p className="mt-1 font-semibold">4 skills</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">Career Goal</p>
            <p className="mt-1 font-semibold">{profile.career}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  editing,
  onChange,
}: {
  label: string
  value: string
  editing: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary"
        />
      ) : (
        <div className="mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          {value}
        </div>
      )}
    </div>
  )
}
