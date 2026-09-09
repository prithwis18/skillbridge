import type { Context } from 'hono';
import { redis } from '../context.js';
import { SOURCES } from '../sources/index.js';

export async function health(c: Context) {
  try {
    await redis.ping();
    return c.json({ ok: true, service: 'scraper', sources: SOURCES.map((s) => s.name) });
  } catch {
    return c.json({ ok: false }, 503);
  }
}
