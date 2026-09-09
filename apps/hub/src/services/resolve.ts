import type { Db } from '@sih/db';
import {
  STREAMS, sessionChannel, recsCacheKey, RECS_TTL_SECONDS,
  gapsHash, xaddJson, log, RecommendationResult,
  type HubRequest, type RedisClient,
} from '@sih/shared';
import { config } from '../config.js';
import { rank, thinlyCovered } from './catalogue.js';

/** Cache -> coverage check -> optional scrape -> rank -> publish. */
export async function resolveGaps(db: Db, redis: RedisClient, req: HubRequest): Promise<void> {
  const { sessionId, gaps } = req;
  const cacheKey = recsCacheKey(gapsHash(gaps));

  const cached = await redis.get(cacheKey);
  if (cached) {
    log.info({ sessionId, cacheKey }, 'cache hit, skipping db + scrape');
    await redis.publish(sessionChannel(sessionId), JSON.stringify({ sessionId, cached: true, ...JSON.parse(cached) }));
    return;
  }

  const wanted = gaps.map((g) => g.skill);
  let thin = await thinlyCovered(db, wanted);

  if (thin.length > 0) {
    log.info({ sessionId, thin }, 'coverage gap, requesting scrape');
    await xaddJson(redis, STREAMS.scrapeRequests, { sessionId, kind: 'course', skills: thin });
    // ponytail: polls for coverage instead of a done-signal from the scraper.
    // Fine at POC volume; add a per-request done channel if scrapes get slow.
    const deadline = Date.now() + config.scrapeWaitMs;
    while (Date.now() < deadline && thin.length > 0) {
      await new Promise((r) => setTimeout(r, 500));
      thin = await thinlyCovered(db, wanted);
    }
    if (thin.length > 0) log.warn({ sessionId, thin }, 'scrape wait expired, answering with what we have');
  }

  const result = RecommendationResult.parse({ gaps, recommendations: await rank(db, gaps) });
  const { recommendations } = result;

  // Cache before publishing so a fast retry of the same gap set hits.
  await redis.set(cacheKey, JSON.stringify(result), 'EX', RECS_TTL_SECONDS);
  await redis.publish(sessionChannel(sessionId), JSON.stringify({ sessionId, cached: false, ...result }));
  log.info({ sessionId, count: recommendations.length }, 'recommendations published');
}
