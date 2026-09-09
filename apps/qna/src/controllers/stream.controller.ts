import type { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { sessionChannel, recsCacheKey, gapsHash, log, RecommendationPayload } from '@sih/shared';
import { redis } from '../context.js';
import { loadSession, save } from '../services/session.store.js';

const HEARTBEAT_MS = 15_000;

/** Forwards the hub's recommendations for one session. Own connection: a subscriber can't run other commands. */
export async function streamSession(c: Context) {
  const id = c.req.param('id') ?? '';
  const state = await loadSession(redis, id);
  if (!state) return c.json({ error: 'session not found' }, 404);

  return streamSSE(c, async (stream) => {
    const sub = redis.duplicate();
    const heartbeat = setInterval(() => void stream.writeSSE({ event: 'ping', data: '' }), HEARTBEAT_MS);

    stream.onAbort(() => {
      clearInterval(heartbeat);
      sub.disconnect();
    });

    sub.on('message', (_channel, raw) => {
      const parsed = RecommendationPayload.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        log.warn({ sessionId: id, issues: parsed.error.issues }, 'bad recommendation payload');
        return;
      }
      void stream.writeSSE({ event: 'recommendations', data: raw });
      void markDone(id);
    });

    await sub.subscribe(sessionChannel(id));
    await stream.writeSSE({ event: 'ready', data: JSON.stringify({ sessionId: id }) });

    // Pub/sub is ephemeral: a client that connects after the hub published (a reload, or
    // a slow subscribe) would wait forever. The hub cached the same payload — replay it.
    if (state.gaps.length > 0) {
      const cached = await redis.get(recsCacheKey(gapsHash(state.gaps)));
      if (cached) {
        const data = JSON.stringify({ sessionId: id, cached: true, ...JSON.parse(cached) });
        await stream.writeSSE({ event: 'recommendations', data });
        await markDone(id);
      }
    }

    // Hold the connection open until the client goes away.
    await new Promise<void>((resolve) => stream.onAbort(resolve));
  });
}

async function markDone(id: string) {
  const state = await loadSession(redis, id);
  if (state && state.status !== 'done') {
    state.status = 'done';
    await save(redis, state);
  }
}
