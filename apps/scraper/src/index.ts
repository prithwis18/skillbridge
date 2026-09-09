import { serve } from '@hono/node-server';
import { log } from '@sih/shared';
import { app } from './app.js';
import { config } from './config.js';
import { redis } from './context.js';
import { startConsumers } from './consumers/index.js';

const ctrl = new AbortController();
const consumers = startConsumers(redis, ctrl.signal);

const server = serve({ fetch: app.fetch, port: config.port }, () =>
  log.info({ port: config.port }, 'scraper listening'),
);

async function shutdown() {
  ctrl.abort();
  server.close();
  await Promise.allSettled(consumers);
  redis.disconnect();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
