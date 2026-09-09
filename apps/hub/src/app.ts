import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { routes } from './routes/index.js';

// The web catalogue page reads /resources and /skills straight from the browser.
export const app = new Hono().use('*', cors()).route('/', routes);
