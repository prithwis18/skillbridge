import { createHash } from 'node:crypto';
import type { SkillGap } from './contracts.js';

/** Stable fingerprint of a gap set — order-independent, so the cache actually hits. */
export function gapsHash(gaps: SkillGap[]): string {
  const norm = gaps
    .map((g) => `${g.skill}:${g.currentLevel}:${g.targetLevel}:${g.severity.toFixed(2)}`)
    .sort()
    .join('|');
  return createHash('sha1').update(norm).digest('hex');
}
