/**
 * Class strings repeated across pages. Kept as constants rather than @apply so the
 * utilities stay visible and Tailwind keeps its dead-class detection.
 */
export const card = 'bg-card rounded-card shadow-[var(--shadow-card)]';

export const btn =
  'rounded-full font-semibold text-[15px] transition disabled:opacity-45 ' +
  'disabled:cursor-not-allowed cursor-pointer';
export const btnPrimary = `${btn} px-7 py-3.5 bg-accent text-accent-ink hover:brightness-96`;
export const btnGhost = `${btn} px-7 py-3.5 bg-fill text-ink hover:brightness-96`;
export const btnOutline =
  'block rounded-[10px] border border-accent-edge py-2.5 text-center text-[13.5px] ' +
  'font-semibold text-accent-deep no-underline transition hover:bg-accent-soft';

export const input =
  'w-full rounded-[15px] border border-line bg-card px-[18px] py-[15px] text-[15px] ' +
  'text-ink outline-none transition placeholder:text-ink-faint ' +
  'focus:border-slate-300 focus:ring-4 focus:ring-accent/30';

export const chip =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 ' +
  'text-[14.5px] transition';
export const chipOff = 'border-line bg-card hover:border-gray-300';
export const chipOn = 'border-transparent bg-fill pl-3';

export const tag =
  'inline-block rounded-full bg-accent/40 px-2.5 py-1 text-[11.5px] font-semibold ' +
  'text-accent-ink capitalize';

export const label = 'mb-2.5 text-[13.5px] font-semibold';
export const lede = 'mb-6 text-[15px] text-ink-faint';
export const h1 = 'mb-2.5 text-[30px] font-extrabold leading-[1.18] tracking-[-0.025em]';
export const h2 = 'mb-2 text-[22px] font-bold tracking-[-0.02em]';
