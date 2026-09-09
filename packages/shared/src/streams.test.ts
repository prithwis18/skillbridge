/**
 * consumeGroup ack/DLQ behaviour — the only non-trivial shared logic.
 * Needs a live Redis (REDIS_URL); skips without one.
 * Run: pnpm --filter @sih/shared test
 */
import assert from 'node:assert/strict';
import { z } from 'zod';
import { makeRedis, xaddJson, consumeGroup } from './redis.js';
import { STREAMS } from './events.js';

const Msg = z.object({ n: z.number() });
const stream = `test:stream:${Date.now()}`;
const group = 'test-group';

const redis = makeRedis();
try {
  await redis.ping();
} catch {
  console.log('SKIP streams.test.ts — no Redis at REDIS_URL');
  redis.disconnect();
  process.exit(0);
}

const dlqBefore = await redis.xlen(STREAMS.dlq);
// Remember where the DLQ ended so this test can remove only its own entry afterwards.
const dlqMark = (await redis.xrevrange(STREAMS.dlq, '+', '-', 'COUNT', 1))[0]?.[0] ?? '0';

await xaddJson(redis, stream, { n: 1 });
await xaddJson(redis, stream, { nope: true }); // fails schema -> dlq
await xaddJson(redis, stream, { n: 2 });

const seen: number[] = [];
const ctrl = new AbortController();
const consumer = consumeGroup(redis.duplicate(), {
  stream, group, consumer: 'c1', schema: Msg, blockMs: 200, signal: ctrl.signal,
  handler: async (m) => { seen.push(m.n); },
});

// Poll until both land, rather than sleep a fixed guess.
for (let i = 0; i < 50 && seen.length < 2; i++) await new Promise((r) => setTimeout(r, 100));
ctrl.abort();
await consumer;

assert.deepEqual(seen, [1, 2], 'valid messages delivered in order');

const pending = (await redis.xpending(stream, group)) as [number, ...unknown[]];
assert.equal(pending[0], 0, 'all handled messages acked, nothing left pending');

const dlqAfter = await redis.xlen(STREAMS.dlq);
assert.equal(dlqAfter - dlqBefore, 1, 'the schema-invalid message was parked on the dlq');

// Leave the DLQ as we found it: a non-empty DLQ is a real signal, not test residue.
const parked = await redis.xrange(STREAMS.dlq, `(${dlqMark}`, '+');
const ours = parked.filter(([, f]) => f[1]?.includes(stream)).map(([id]) => id);
if (ours.length > 0) await redis.xdel(STREAMS.dlq, ...ours);
assert.equal(await redis.xlen(STREAMS.dlq), dlqBefore, 'dlq restored');

await redis.del(stream);
redis.disconnect();
console.log('ok — streams.test.ts');
