import { and, eq, inArray } from 'drizzle-orm';
import { resources, resourceSkills, skills } from '@sih/db';
import type { Db } from '@sih/db';
import type { Recommendation, SkillGap } from '@sih/shared';
import { config } from '../config.js';

export const listSkills = (db: Db) => db.select().from(skills).orderBy(skills.slug);

const RESOURCE_COLUMNS = {
  id: resources.id, kind: resources.kind, title: resources.title, url: resources.url,
  provider: resources.provider, level: resources.level, durationMins: resources.durationMins,
};

/**
 * Catalogue listing for the browse pages. `kind` is what separates courses from jobs.
 * Skills come back attached because the cards label themselves with them.
 */
export async function listResources(db: Db, opts: { skill?: string; kind?: string } = {}) {
  const where = [
    opts.kind ? eq(resources.kind, opts.kind) : undefined,
    opts.skill ? inArray(skills.slug, [opts.skill]) : undefined,
  ].filter(Boolean);

  const rows = opts.skill
    ? await db
        .select(RESOURCE_COLUMNS)
        .from(resourceSkills)
        .innerJoin(resources, eq(resources.id, resourceSkills.resourceId))
        .innerJoin(skills, eq(skills.id, resourceSkills.skillId))
        .where(and(...where))
        .limit(60)
    : await db.select(RESOURCE_COLUMNS).from(resources).where(and(...where)).limit(60);

  return withSkills(db, rows);
}

/** One extra query for the whole page rather than one per card. */
async function withSkills<T extends { id: string }>(db: Db, rows: T[]) {
  if (rows.length === 0) return rows.map((r) => ({ ...r, skills: [] as string[] }));

  const links = await db
    .select({ resourceId: resourceSkills.resourceId, slug: skills.slug, weight: resourceSkills.weight })
    .from(resourceSkills)
    .innerJoin(skills, eq(skills.id, resourceSkills.skillId))
    .where(inArray(resourceSkills.resourceId, rows.map((r) => r.id)));

  const byResource = new Map<string, { slug: string; weight: number }[]>();
  for (const l of links) {
    const list = byResource.get(l.resourceId) ?? [];
    list.push({ slug: l.slug, weight: l.weight });
    byResource.set(l.resourceId, list);
  }
  // Heaviest first, so a card's lead label is the skill it covers best.
  return rows.map((r) => ({
    ...r,
    skills: (byResource.get(r.id) ?? []).sort((a, b) => b.weight - a.weight).map((s) => s.slug),
  }));
}

/** Slugs backed by fewer than minCoverage resources. */
export async function thinlyCovered(db: Db, slugs: string[]): Promise<string[]> {
  const rows = await db
    .select({ slug: skills.slug, resourceId: resourceSkills.resourceId })
    .from(skills)
    .leftJoin(resourceSkills, eq(resourceSkills.skillId, skills.id))
    .where(inArray(skills.slug, slugs));

  const counts = new Map<string, number>(slugs.map((s) => [s, 0]));
  for (const row of rows) {
    if (row.resourceId) counts.set(row.slug, (counts.get(row.slug) ?? 0) + 1);
  }
  return slugs.filter((s) => (counts.get(s) ?? 0) < config.minCoverage);
}

/** Score = sum(link weight x gap severity). Two urgent gaps outrank one mild gap. */
export async function rank(db: Db, gaps: SkillGap[]): Promise<Recommendation[]> {
  const severity = new Map(gaps.map((g) => [g.skill, g.severity]));
  const rows = await db
    .select({
      id: resources.id, kind: resources.kind, title: resources.title, url: resources.url,
      provider: resources.provider, level: resources.level, durationMins: resources.durationMins,
      slug: skills.slug, weight: resourceSkills.weight,
    })
    .from(resourceSkills)
    .innerJoin(resources, eq(resources.id, resourceSkills.resourceId))
    .innerJoin(skills, eq(skills.id, resourceSkills.skillId))
    .where(inArray(skills.slug, [...severity.keys()]));

  const byResource = new Map<string, Recommendation>();
  for (const row of rows) {
    const sev = severity.get(row.slug) ?? 0;
    const existing = byResource.get(row.id);
    if (existing) {
      existing.matchedSkills.push(row.slug);
      existing.score += row.weight * sev;
      continue;
    }
    byResource.set(row.id, {
      resourceId: row.id,
      kind: row.kind as Recommendation['kind'],
      title: row.title,
      url: row.url,
      provider: row.provider,
      level: row.level as Recommendation['level'],
      durationMins: row.durationMins,
      matchedSkills: [row.slug],
      score: row.weight * sev,
    });
  }

  return [...byResource.values()]
    .map((r) => ({ ...r, score: Number(r.score.toFixed(4)) }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, config.maxRecommendations);
}
