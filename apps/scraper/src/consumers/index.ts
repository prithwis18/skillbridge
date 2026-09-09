import { STREAMS, GROUPS, consumeGroup, ScrapeRequest, type RedisClient } from '@sih/shared';
import { runScrape } from '../services/scrape.js';

export function startConsumers(redis: RedisClient, signal: AbortSignal): Promise<void>[] {
  return [
    consumeGroup(redis.duplicate(), {
      stream: STREAMS.scrapeRequests,
      group: GROUPS.scraper,
      consumer: `scraper-${process.pid}`,
      schema: ScrapeRequest,
      signal,
      handler: (req) => runScrape(redis, req),
    }),
  ];
}
