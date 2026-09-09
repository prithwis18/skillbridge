/** Every Redis key, stream and channel name. No stringly-typed keys at call sites. */

export const STREAMS = {
  /** QnA agent -> hub: a session finished, resolve these gaps. */
  hubRequests: 'stream:hub.requests',
  /** hub -> scraper: skills with thin coverage, go find more. */
  scrapeRequests: 'stream:scrape.requests',
  /** scraper -> hub: freshly found resources to upsert. */
  resourcesDiscovered: 'stream:resources.discovered',
  /** ingestor -> hub: admin-pushed resources to upsert. */
  ingestResources: 'stream:ingest.resources',
  /** anything that failed schema validation, parked for inspection. */
  dlq: 'stream:dlq',
} as const;

export const GROUPS = { hub: 'hub', scraper: 'scraper' } as const;

/** Hub publishes recommendations here; QnA subscribes per session. */
export const sessionChannel = (sessionId: string) => `qna:session:${sessionId}`;

/** Cache of gap-set -> recommendations. */
export const recsCacheKey = (hash: string) => `cache:recs:${hash}`;

/** QnA session state (transcript, status). */
export const sessionKey = (sessionId: string) => `session:${sessionId}`;

export const SESSION_TTL_SECONDS = 60 * 60 * 24;
export const RECS_TTL_SECONDS = 300;
