import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth-shell'
import { buttonVariants } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check your email"
      description="Confirm your address to activate your Skillora account."
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/60 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success-muted text-success">
            <MailCheck className="size-5" />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ve sent you a confirmation link. Open it to finish setting up
            your account, then sign in to start your onboarding.
          </p>
        </div>
        <Link href="/auth/login" className={buttonVariants({ variant: 'outline' })}>
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
