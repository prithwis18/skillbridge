import type { Context } from 'hono';
import { db } from '../context.js';
import { listResources, listSkills } from '../services/catalogue.js';

export async function getResources(c: Context) {
  const rows = await listResources(db, {
    skill: c.req.query('skill'),
    kind: c.req.query('kind'),
  });
  return c.json({ count: rows.length, resources: rows });
}

export async function getSkills(c: Context) {
  return c.json(await listSkills(db));
}
