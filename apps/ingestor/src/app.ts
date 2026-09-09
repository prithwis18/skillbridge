import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { routes } from './routes/index.js';

export const app = new Hono().use('*', cors()).route('/', routes);
