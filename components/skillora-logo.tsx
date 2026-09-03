import { cn } from "@/lib/utils"

/**
 * Skillora brand mark.
 * A rising path of connected nodes — representing skills linking together
 * and progressing upward into an employment outcome (career progression +
 * connection/bridge). Deliberately geometric, not an AI/robot motif.
 */
export function SkilloraLogo({
  className,
  title = "Skillora",
}: {
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("size-full", className)}
    >
      {/* connecting bridge path */}
      <path
        d="M6 23 L13 16 L19 19 L26 9"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
      {/* skill nodes along the path */}
      <circle cx="6" cy="23" r="2.4" fill="currentColor" className="opacity-70" />
      <circle cx="13" cy="16" r="2.4" fill="currentColor" className="opacity-80" />
      <circle cx="19" cy="19" r="2.4" fill="currentColor" className="opacity-80" />
      {/* employment-ready endpoint */}
      <circle cx="26" cy="9" r="3.4" fill="currentColor" />
    </svg>
  )
}
