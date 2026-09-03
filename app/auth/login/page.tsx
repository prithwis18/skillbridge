'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed')
    return 'Please confirm your email before signing in — check your inbox.'
  if (code === 'over_request_rate_limit' || status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  // Genericize the credential/existence signal to avoid account enumeration.
  return 'Invalid email or password.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError(loginErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue building toward your target role."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
