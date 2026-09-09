'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { SPRING } from '@/lib/motion';

const LINKS = [
  { href: '/', label: 'Gap' },
  { href: '/courseware', label: 'Courseware' },
  { href: '/jobs', label: 'Jobs' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 px-8 py-5">
      <Link href="/" className="text-[17px] font-bold tracking-[-0.02em] text-ink no-underline">
        Skill Bridge
      </Link>

      <div className="ml-auto flex gap-1">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-full px-3.5 py-[7px] text-sm font-medium no-underline transition ${
                active ? 'text-ink' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {/* One shared layoutId slides the pill between tabs instead of cross-fading. */}
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-white/90"
                  transition={SPRING}
                />
              )}
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
