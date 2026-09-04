"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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

        {/* Form */}
        <form className="space-y-5">
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
              placeholder="you@example.com"
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
                placeholder="Enter your password"
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Login
          </button>
        </form>

        {/* Signup */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}