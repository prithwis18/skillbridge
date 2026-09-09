import { serve } from '@hono/node-server';
import { log } from '@sih/shared';
import { app } from './app.js';
import { config } from './config.js';
import { db, redis, sql } from './context.js';
import { startConsumers } from './consumers/index.js';

const ctrl = new AbortController();
const consumers = startConsumers(db, redis, ctrl.signal);

const server = serve({ fetch: app.fetch, port: config.port }, () =>
  log.info({ port: config.port }, 'hub listening'),
);

async function shutdown() {
  log.info({}, 'shutting down');
  ctrl.abort();
  server.close();
  await Promise.allSettled(consumers);
  await sql.end();
  redis.disconnect();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
