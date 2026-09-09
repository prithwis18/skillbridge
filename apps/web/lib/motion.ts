// Shared timings so every screen animates with the same character.
export const SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
} as const;

/** Children animate in sequence rather than all at once. */
export const stagger = (delay = 0.045) => ({
  animate: { transition: { staggerChildren: delay } },
});

export const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
} as const;
