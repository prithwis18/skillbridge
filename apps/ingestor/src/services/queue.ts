import { STREAMS, xaddJson, log, type ResourceInput, type RedisClient } from '@sih/shared';

/** Hub owns the write; this only queues. */
export async function queueResources(redis: RedisClient, resources: ResourceInput[]) {
  const entryId = await xaddJson(redis, STREAMS.ingestResources, { source: 'ingest', resources });
  log.info({ entryId, count: resources.length }, 'queued admin resources');
  return entryId;
}
