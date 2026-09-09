import { serve } from '@hono/node-server';
import { log } from '@sih/shared';
import { app } from './app.js';
import { config } from './config.js';
import { redis } from './context.js';

const server = serve({ fetch: app.fetch, port: config.port }, () =>
  log.info({ port: config.port }, 'qna listening'),
);

const shutdown = () => { server.close(); redis.disconnect(); process.exit(0); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
