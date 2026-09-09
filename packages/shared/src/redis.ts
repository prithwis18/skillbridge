import Redis from 'ioredis';
import type { z } from 'zod';
import { STREAMS } from './events.js';
import { log } from './log.js';

export type RedisClient = Redis;

export function makeRedis(url = process.env.REDIS_URL ?? 'redis://localhost:6379'): RedisClient {
  return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
}

/** Append a JSON payload to a stream. Returns the entry id. */
export async function xaddJson(redis: RedisClient, stream: string, payload: unknown): Promise<string> {
  return redis.xadd(stream, '*', 'data', JSON.stringify(payload)) as Promise<string>;
}

export type ConsumeOptions<T> = {
  stream: string;
  group: string;
  consumer: string;
  // Input side unknown: .default() makes input and output types differ.
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  handler: (msg: T, id: string) => Promise<void>;
  /** ms to block waiting for new entries before looping */
  blockMs?: number;
  signal?: AbortSignal;
};

type RawEntry = [id: string, fields: string[]];
type RawStream = [stream: string, entries: RawEntry[]];

/**
 * The consumer loop every service reuses: ensure group, XREADGROUP, validate, handle, XACK.
 *
 * - Schema failure -> stream:dlq, then acked. One bad entry must not wedge the group.
 * - Handler throw -> NOT acked. Stays pending, redelivered on restart.
 * - Starts at own-pending ('0') so a crashed process resumes its in-flight work, then '>'.
 * - Owns `redis` and closes it on exit. XREADGROUP blocks, so pass a `.duplicate()`.
 */
export async function consumeGroup<T>(redis: RedisClient, opts: ConsumeOptions<T>): Promise<void> {
  const { stream, group, consumer, schema, handler, blockMs = 5000, signal } = opts;
  await ensureGroup(redis, stream, group);

  // Abort must cut the connection: a blocked XREADGROUP ignores the signal.
  const onAbort = () => redis.disconnect();
  signal?.addEventListener('abort', onAbort, { once: true });
  log.info({ stream, group, consumer }, 'consumer started');

  let cursor = '0'; // drain own pending backlog first

  try {
    while (!signal?.aborted) {
      let res: RawStream[] | null;
      try {
        res = (await redis.xreadgroup(
          'GROUP', group, consumer,
          'COUNT', 20,
          'BLOCK', blockMs,
          'STREAMS', stream, cursor,
        )) as RawStream[] | null;
      } catch (err) {
        if (signal?.aborted) break;
        log.error({ stream, err }, 'xreadgroup failed, backing off');
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      const entries = res?.[0]?.[1] ?? [];
      if (entries.length === 0) {
        if (cursor === '0') cursor = '>'; // backlog drained, new messages only
        continue;
      }

      for (const [id, fields] of entries) {
        const raw = fieldValue(fields, 'data');
        const parsed = schema.safeParse(raw === undefined ? undefined : safeJson(raw));
        if (!parsed.success) {
          log.warn({ stream, id, issues: parsed.error.issues }, 'invalid message -> dlq');
          await xaddJson(redis, STREAMS.dlq, { stream, id, raw, issues: parsed.error.issues });
          await redis.xack(stream, group, id);
          continue;
        }
        try {
          await handler(parsed.data, id);
          await redis.xack(stream, group, id);
        } catch (err) {
          // Unacked on purpose: stays pending, retried on restart.
          log.error({ stream, id, err }, 'handler failed, leaving message pending');
        }
      }
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
    redis.disconnect();
    log.info({ stream, group, consumer }, 'consumer stopped');
  }
}

async function ensureGroup(redis: RedisClient, stream: string, group: string) {
  try {
    // MKSTREAM so the group exists before the first producer writes.
    await redis.xgroup('CREATE', stream, group, '0', 'MKSTREAM');
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes('BUSYGROUP')) throw err;
  }
}

function fieldValue(fields: string[], key: string): string | undefined {
  for (let i = 0; i < fields.length; i += 2) if (fields[i] === key) return fields[i + 1];
  return undefined;
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
