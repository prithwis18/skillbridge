import {
  STREAMS, GROUPS, consumeGroup, log, HubRequest, ResourceBatch, type RedisClient,
} from '@sih/shared';
import type { Db } from '@sih/db';
import { upsertBatch } from '../services/upsert.js';
import { resolveGaps } from '../services/resolve.js';

/** One connection per consumer (XREADGROUP blocks it). Returns the loops so shutdown can await them. */
export function startConsumers(db: Db, redis: RedisClient, signal: AbortSignal): Promise<void>[] {
  const consumer = `hub-${process.pid}`;
  const upsertFrom = (label: string) => async (batch: ResourceBatch) => {
    const written = await upsertBatch(db, batch);
    log.info({ source: batch.source, written }, label);
  };

  return [
    consumeGroup(redis.duplicate(), {
      stream: STREAMS.hubRequests, group: GROUPS.hub, consumer, signal,
      schema: HubRequest,
      handler: (req) => resolveGaps(db, redis, req),
    }),
    consumeGroup(redis.duplicate(), {
      stream: STREAMS.ingestResources, group: GROUPS.hub, consumer, signal,
      schema: ResourceBatch,
      handler: upsertFrom('ingested resources'),
    }),
    consumeGroup(redis.duplicate(), {
      stream: STREAMS.resourcesDiscovered, group: GROUPS.hub, consumer, signal,
      schema: ResourceBatch,
      handler: upsertFrom('stored scraped resources'),
    }),
  ];
}
