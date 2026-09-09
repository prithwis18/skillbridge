import type { Context } from 'hono';
import { z } from 'zod';
import { ResourceInput } from '@sih/shared';
import { redis } from '../context.js';
import { queueResources } from '../services/queue.js';

const Body = z.union([ResourceInput, z.array(ResourceInput).min(1).max(200)]);

export async function postResources(c: Context) {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: 'body must be JSON' }, 400);
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: 'validation failed', issues: parsed.error.issues }, 400);
  }

  const resources = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  const entryId = await queueResources(redis, resources);
  // 202: accepted, not yet persisted — the hub applies it.
  return c.json({ accepted: resources.length, entryId }, 202);
}
