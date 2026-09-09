import { timingSafeEqual } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import { config } from '../config.js';

/** Admins write straight into the catalogue. Constant-time compare. */
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('authorization') ?? '';
  const presented = Buffer.from(header.startsWith('Bearer ') ? header.slice(7) : '');
  const expected = Buffer.from(config.adminToken);
  if (presented.length !== expected.length || !timingSafeEqual(presented, expected)) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  await next();
};
