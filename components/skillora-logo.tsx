import { cn } from '@/lib/utils'

/**
 * Skillora mark — three ascending nodes linked by a rising path.
 * Represents skills (nodes) + connection (links) + career progression (the
 * upward step). Deliberately geometric: no robot, no brain, no gradient.
 */
export function SkilloraMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', className)}
      aria-hidden="true"
    >
      {/* rising connection path */}
      <path d="M4 17.5 10 11l4 3 6-7.5" strokeOpacity={0.55} />
      {/* skill nodes along the path */}
      <circle cx="4" cy="17.5" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="11" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="6.5" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SkilloraWordmark({
  className,
  subtitle = true,
}: {
  className?: string
  subtitle?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <SkilloraMark className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Skillora
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground">
            Skill-to-Job Intelligence
          </p>
        )}
      </div>
    </div>
  )
}
