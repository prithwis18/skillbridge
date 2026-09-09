import { STREAMS, xaddJson, log, type ScrapeRequest, type RedisClient } from '@sih/shared';
import { SOURCES } from '../sources/index.js';

const BATCH_SIZE = 100; // stays under the ResourceBatch cap the hub validates against

/** Fan out over every source matching the request kind, then emit for the hub to upsert. */
export async function runScrape(redis: RedisClient, req: ScrapeRequest): Promise<void> {
  const sources = SOURCES.filter((s) => s.kind === req.kind);

  const resources = (
    await Promise.all(
      sources.flatMap((s) =>
        req.skills.map(async (skill) => {
          try {
            return await s.fetch(skill);
          } catch (err) {
            log.error({ source: s.name, skill, err }, 'source fetch failed');
            return [];
          }
        }),
      ),
    )
  ).flat();

  if (resources.length === 0) {
    log.warn({ sessionId: req.sessionId, skills: req.skills }, 'scrape produced nothing');
    return;
  }

  for (let i = 0; i < resources.length; i += BATCH_SIZE) {
    await xaddJson(redis, STREAMS.resourcesDiscovered, {
      source: 'scrape',
      resources: resources.slice(i, i + BATCH_SIZE),
    });
  }
  log.info({ sessionId: req.sessionId, skills: req.skills, found: resources.length }, 'scrape done');
}
