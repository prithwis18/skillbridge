import type { Context } from 'hono';
import { redis } from '../context.js';

export async function health(c: Context) {
  try {
    await redis.ping();
    return c.json({ ok: true, service: 'ingestor' });
  } catch {
    return c.json({ ok: false }, 503);
  }
}
