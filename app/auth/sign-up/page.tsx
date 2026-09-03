'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const statusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'working_professional', label: 'Working Professional' },
  { value: 'other', label: 'Other' },
] as const

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'weak_password') return 'Please choose a stronger password.'
  if (code === 'email_address_invalid')
    return 'Please use a real email address — example and test domains are not supported.'
  if (code === 'email_address_not_authorized')
    return 'We cannot send a confirmation email to that address. Please use a different one.'
  if (code === 'validation_failed') return 'Please check the details you entered.'
  if (code === 'over_email_send_rate_limit' || status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  return 'Unable to complete sign-up. Please try again.'
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<string>('student')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            name,
            user_type: userType,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      console.error('Sign-up error:', err)
      setError(signUpErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Build the right skills. Become ready for the right opportunity."
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Aarav Sharma"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Current Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((opt) => {
              const active = userType === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUserType(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-ring hover:bg-secondary',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
