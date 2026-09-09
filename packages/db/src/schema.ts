import {
  pgTable, text, integer, real, jsonb, timestamp, uuid, uniqueIndex, index, primaryKey,
} from 'drizzle-orm/pg-core';

// No sessions table: QnA session state is Redis-only, expires with the session.

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    category: text('category').notNull().default('general'),
  },
  (t) => [uniqueIndex('skills_slug_uniq').on(t.slug)],
);

/** Courses and jobs share one table, split by `kind`. Job boards later: new source, no migration. */
export const resources = pgTable(
  'resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull().default('course'),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    provider: text('provider').notNull(),
    level: text('level').notNull().default('beginner'),
    durationMins: integer('duration_mins'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Re-scraping the same item updates it instead of duplicating it.
    uniqueIndex('resources_source_external_uniq').on(t.source, t.externalId),
    index('resources_kind_idx').on(t.kind),
  ],
);

export const resourceSkills = pgTable(
  'resource_skills',
  {
    resourceId: uuid('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
    weight: real('weight').notNull().default(1),
  },
  (t) => [
    primaryKey({ columns: [t.resourceId, t.skillId] }),
    index('resource_skills_skill_idx').on(t.skillId),
  ],
);
