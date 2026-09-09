'use client';

import { motion } from 'motion/react';
import { SPRING } from '@/lib/motion';

export function Progress({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  return (
    <>
      <div className="mb-2.5 text-[13px] font-medium text-ink-soft">
        Step {step}/{total}
      </div>
      <div className="mb-[22px] h-1 overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={SPRING}
        />
      </div>
    </>
  );
}
