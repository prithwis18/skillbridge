'use client';

import { motion } from 'motion/react';
import { stagger } from '@/lib/motion';
import type { RecommendationPayload } from '@/lib/types';
import { ResourceCard } from './ResourceCard';

export function Recommendations({ payload }: { payload: RecommendationPayload }) {
  if (payload.recommendations.length === 0) {
    return <p className="text-ink-faint">Nothing in the catalogue covers these gaps yet.</p>;
  }

  return (
    <motion.div
      // Half-width column, so cards pack tighter than on the browse pages.
      className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]"
      variants={stagger()}
      initial="initial"
      animate="animate"
    >
      {payload.recommendations.map((r, i) => (
        <ResourceCard
          key={r.resourceId}
          rank={i + 1}
          resource={{
            id: r.resourceId,
            kind: r.kind,
            title: r.title,
            url: r.url,
            provider: r.provider,
            level: r.level,
            durationMins: r.durationMins,
            // Only the skills this resource closes for *this* student.
            skills: r.matchedSkills,
          }}
        />
      ))}
    </motion.div>
  );
}
