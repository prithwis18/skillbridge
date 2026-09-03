import { cn } from "@/lib/utils"

/**
 * Skillora brand mark.
 * Three ascending nodes connected by a rising path — representing skills,
 * connection, and career progression. Deliberately not a robot or AI brain.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Skillora"
      className={cn("size-full", className)}
    >
      {/* rising connection path */}
      <path
        d="M7 23L14 16L19 20L25 9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
      {/* skill nodes along the path */}
      <circle cx="7" cy="23" r="2.6" fill="currentColor" className="opacity-70" />
      <circle cx="14" cy="16" r="2.6" fill="currentColor" className="opacity-85" />
      <circle cx="19" cy="20" r="2.2" fill="currentColor" className="opacity-70" />
      {/* destination: employment-ready peak */}
      <circle cx="25" cy="9" r="3.2" fill="currentColor" />
    </svg>
  )
}

export function Logo({
  className,
  showText = true,
  subtitle = true,
  tone = "sidebar",
}: {
  className?: string
  showText?: boolean
  subtitle?: boolean
  tone?: "sidebar" | "brand"
}) {
  const markWrap =
    tone === "sidebar"
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "bg-primary text-primary-foreground"
  const title = tone === "sidebar" ? "text-sidebar-primary" : "text-foreground"
  const sub = tone === "sidebar" ? "text-sidebar-foreground/70" : "text-muted-foreground"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("flex size-9 items-center justify-center rounded-md p-1.5", markWrap)}>
        <LogoMark />
      </div>
      {showText && (
        <div className="leading-tight">
          <p className={cn("text-sm font-semibold tracking-tight", title)}>Skillora</p>
          {subtitle && (
            <p className={cn("text-[11px]", sub)}>Skill-to-Job Intelligence</p>
          )}
        </div>
      )}
    </div>
  )
}
