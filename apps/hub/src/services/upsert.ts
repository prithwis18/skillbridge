import { eq, inArray } from 'drizzle-orm';
import { resources, resourceSkills, skills } from '@sih/db';
import type { Db } from '@sih/db';
import { log, type ResourceBatch, type ResourceInput } from '@sih/shared';

export async function upsertBatch(db: Db, batch: ResourceBatch): Promise<number> {
  let written = 0;
  for (const r of batch.resources) {
    try {
      await upsertOne(db, batch.source, r);
      written++;
    } catch (err) {
      log.error({ externalId: r.externalId, err }, 'resource upsert failed');
    }
  }
  return written;
}

async function upsertOne(db: Db, source: string, r: ResourceInput) {
  const [row] = await db
    .insert(resources)
    .values({
      kind: r.kind,
      source,
      externalId: r.externalId,
      title: r.title,
      url: r.url,
      provider: r.provider,
      level: r.level,
      durationMins: r.durationMins ?? null,
      metadata: r.metadata,
    })
    .onConflictDoUpdate({
      target: [resources.source, resources.externalId],
      set: {
        title: r.title, url: r.url, provider: r.provider,
        level: r.level, durationMins: r.durationMins ?? null, metadata: r.metadata,
      },
    })
    .returning({ id: resources.id });

  if (!row) throw new Error('upsert returned no row');

  // Create unknown slugs: a stale vocabulary must not drop a resource.
  const slugs = r.skills.map((s) => s.slug);
  await db
    .insert(skills)
    .values(slugs.map((slug) => ({ slug, name: slug, category: 'uncategorized' })))
    .onConflictDoNothing({ target: skills.slug });

  const known = await db
    .select({ id: skills.id, slug: skills.slug })
    .from(skills)
    .where(inArray(skills.slug, slugs));
  const bySlug = new Map(known.map((k) => [k.slug, k.id]));

  // Replace link set: a re-scrape that drops a skill drops the link.
  await db.delete(resourceSkills).where(eq(resourceSkills.resourceId, row.id));
  const links = r.skills
    .map((s) => ({ resourceId: row.id, skillId: bySlug.get(s.slug), weight: s.weight }))
    .filter((l): l is { resourceId: string; skillId: string; weight: number } => Boolean(l.skillId));
  if (links.length > 0) await db.insert(resourceSkills).values(links).onConflictDoNothing();
}
