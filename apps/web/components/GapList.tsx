'use client';

import { motion } from 'motion/react';
import { item, stagger } from '@/lib/motion';
import type { SkillGap } from '@/lib/types';

const pretty = (slug: string) => slug.replace(/-/g, ' ');

export function GapList({ gaps }: { gaps: SkillGap[] }) {
  const sorted = [...gaps].sort((a, b) => b.severity - a.severity);

  return (
    <motion.div variants={stagger(0.05)} initial="initial" animate="animate">
      {sorted.map((g) => (
        <motion.div
          className="mb-3.5 flex items-center gap-3.5 text-sm"
          key={g.skill}
          variants={item}
          title={g.rationale}
        >
          <span className="w-[150px] font-semibold capitalize">{pretty(g.skill)}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-fill">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(g.severity * 100)}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 30, delay: 0.1 }}
            />
          </span>
          <span className="w-14 text-right text-[13px] tabular-nums text-ink-faint">
            {g.currentLevel} → {g.targetLevel}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
