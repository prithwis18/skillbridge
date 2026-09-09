import type { Context } from 'hono';
import { log } from '@sih/shared';
import { sql, redis } from '../context.js';

export async function health(c: Context) {
  try {
    await sql`select 1`;
    await redis.ping();
    return c.json({ ok: true, service: 'hub' });
  } catch (err) {
    log.error({ err }, 'health check failed');
    return c.json({ ok: false }, 503);
  }
}
