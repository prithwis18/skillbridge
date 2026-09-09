import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { ResourceInput, log } from '@sih/shared';
import type { Source } from './index.js';

type FixtureCourse = {
  title: string; provider: string; level: string;
  durationMins?: number; url: string; skills: [string, number][];
};

const here = dirname(fileURLToPath(import.meta.url));
// src/sources -> package root; build copies fixtures/ next to dist/.
const fixturesPath = resolve(here, '..', '..', 'fixtures', 'courses.json');

let cache: Record<string, FixtureCourse[]> | null = null;

async function load(): Promise<Record<string, FixtureCourse[]>> {
  if (cache) return cache;
  cache = JSON.parse(await readFile(fixturesPath, 'utf8')) as Record<string, FixtureCourse[]>;
  log.info({ skills: Object.keys(cache).length, fixturesPath }, 'fixtures loaded');
  return cache;
}

/** Stable id so a re-scrape updates the same row instead of duplicating it. */
const idFor = (url: string) => `fixture-${createHash('sha1').update(url).digest('hex').slice(0, 16)}`;

/** POC mock. Hand-written courses when the skill is in the file, synthesised otherwise. */
export const fixtureSource: Source = {
  name: 'fixtures',
  kind: 'course',
  async fetch(skillSlug) {
    const all = await load();
    const hits = all[skillSlug];
    const raw: FixtureCourse[] = hits ?? synthesise(skillSlug);
    return raw.flatMap((c) => {
      const parsed = ResourceInput.safeParse({
        kind: 'course',
        externalId: idFor(c.url),
        title: c.title,
        url: c.url,
        provider: c.provider,
        level: c.level,
        durationMins: c.durationMins,
        skills: c.skills.map(([slug, weight]) => ({ slug, weight })),
        metadata: { source: 'fixtures', requestedFor: skillSlug },
      });
      if (!parsed.success) {
        log.warn({ title: c.title, issues: parsed.error.issues }, 'fixture failed validation, dropped');
        return [];
      }
      return [parsed.data];
    });
  },
};

function synthesise(slug: string): FixtureCourse[] {
  const pretty = slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
  return [
    {
      title: `${pretty}: Foundations`,
      provider: 'OpenCourseWare',
      level: 'beginner',
      durationMins: 300,
      url: `https://example.edu/courses/${slug}-foundations`,
      skills: [[slug, 1]],
    },
    {
      title: `${pretty} in Practice: Project Track`,
      provider: 'OpenCourseWare',
      level: 'intermediate',
      durationMins: 480,
      url: `https://example.edu/courses/${slug}-in-practice`,
      skills: [[slug, 1], ['problem-solving', 0.3]],
    },
  ];
}
