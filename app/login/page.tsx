"use client"

import { useState, type FormEvent } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const demoEmail = "demo@skillbridge.com"
  const demoPassword = "Demo@12345"

  const useDemoAccount = () => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setMessage("")
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.href = "/"
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Skill<span className="text-blue-500">Bridge</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Bridge your skills to your career
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>

          <p className="mt-1 text-sm text-slate-400">
            Login to continue to SkillBridge
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <a
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </a>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-16 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login Message */}
          {message && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {message}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo Account */}
        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-blue-400">🎯 Demo Account</p>

            <p className="mt-1 text-xs text-slate-500">
              Use this account for prototype demonstration
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-300">{demoEmail}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Password</span>
              <span className="text-slate-300">{demoPassword}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={useDemoAccount}
            className="mt-4 w-full rounded-lg border border-blue-500/30 bg-blue-500/10 py-2.5 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
          >
            Use Demo Account
          </button>
        </div>

        {/* Signup */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  )
}

