import { z } from 'zod';

export const ResourceKind = z.enum(['course', 'job']);
export type ResourceKind = z.infer<typeof ResourceKind>;

export const ResourceSource = z.enum(['scrape', 'ingest']);

export const Level = z.enum(['beginner', 'intermediate', 'advanced']);

/** A skill slug: lowercase kebab, e.g. "react", "system-design". */
export const SkillSlug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'skill must be lowercase kebab-case');

/** One resource as it arrives from a scraper source or an admin push. */
export const ResourceInput = z.object({
  kind: ResourceKind.default('course'),
  externalId: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  provider: z.string().min(1).max(200),
  level: Level.default('beginner'),
  durationMins: z.number().int().positive().max(100_000).optional(),
  /** skill slug -> how strongly this resource covers it (0..1) */
  skills: z.array(z.object({ slug: SkillSlug, weight: z.number().min(0).max(1).default(1) })).min(1),
  metadata: z.record(z.unknown()).default({}),
});
export type ResourceInput = z.infer<typeof ResourceInput>;

/** Envelope on stream:ingest.resources and stream:resources.discovered. */
export const ResourceBatch = z.object({
  source: ResourceSource,
  resources: z.array(ResourceInput).min(1).max(200),
});
export type ResourceBatch = z.infer<typeof ResourceBatch>;

/** One gap the QnA agent extracted from the transcript. */
export const SkillGap = z.object({
  skill: SkillSlug,
  currentLevel: z.number().int().min(0).max(5),
  targetLevel: z.number().int().min(0).max(5),
  /** 0..1, how badly this gap needs closing. Drives ranking. */
  severity: z.number().min(0).max(1),
  rationale: z.string().max(500).optional(),
});
export type SkillGap = z.infer<typeof SkillGap>;

/** QnA agent -> hub. */
export const HubRequest = z.object({
  sessionId: z.string().min(1),
  gaps: z.array(SkillGap).min(1).max(20),
});
export type HubRequest = z.infer<typeof HubRequest>;

/** hub -> scraper. */
export const ScrapeRequest = z.object({
  sessionId: z.string().min(1),
  kind: ResourceKind.default('course'),
  skills: z.array(SkillSlug).min(1).max(20),
});
export type ScrapeRequest = z.infer<typeof ScrapeRequest>;

export const Recommendation = z.object({
  resourceId: z.string(),
  kind: ResourceKind,
  title: z.string(),
  url: z.string(),
  provider: z.string(),
  level: Level,
  durationMins: z.number().nullable(),
  /** skills this resource closes, intersected with the session's gaps */
  matchedSkills: z.array(SkillSlug),
  score: z.number(),
});
export type Recommendation = z.infer<typeof Recommendation>;

/** What the cache stores: shared by every session with the same gap set. */
export const RecommendationResult = z.object({
  gaps: z.array(SkillGap),
  recommendations: z.array(Recommendation),
});
export type RecommendationResult = z.infer<typeof RecommendationResult>;

/** hub -> QnA over pub/sub. The session id is stamped per delivery, never cached. */
export const RecommendationPayload = RecommendationResult.extend({
  sessionId: z.string(),
  cached: z.boolean().default(false),
});
export type RecommendationPayload = z.infer<typeof RecommendationPayload>;

export const TranscriptTurn = z.object({
  role: z.enum(['assistant', 'user']),
  content: z.string(),
});
export type TranscriptTurn = z.infer<typeof TranscriptTurn>;

export const SessionStatus = z.enum(['asking', 'resolving', 'done', 'failed']);
export type SessionStatus = z.infer<typeof SessionStatus>;

export const SessionState = z.object({
  id: z.string(),
  status: SessionStatus,
  goal: z.string().max(500).default(''),
  turns: z.array(TranscriptTurn),
  questionCount: z.number().int().min(0),
  /** Suggested answers for the current question, so the client can offer chips. */
  options: z.array(z.string()).default([]),
  gaps: z.array(SkillGap).default([]),
  error: z.string().optional(),
});
export type SessionState = z.infer<typeof SessionState>;
