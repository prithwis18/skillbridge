import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'
import { buttonVariants } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  // `error` is attacker-controlled; only render it if it looks like a code.
  const code = params?.error
  const isErrorCode = typeof code === 'string' && /^[a-z0-9_]{1,64}$/.test(code)

  return (
    <AuthShell
      title="Something went wrong"
      description="We couldn't complete that request."
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-md border border-border bg-secondary/60 p-4">
          <p className="text-sm text-muted-foreground">
            {isErrorCode
              ? `Error code: ${code}`
              : 'An unspecified authentication error occurred. Please try again.'}
          </p>
        </div>
        <Link href="/auth/login" className={buttonVariants({ variant: 'outline' })}>
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
