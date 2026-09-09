import { Hono } from 'hono';
import { routes } from './routes/index.js';

export const app = new Hono().route('/', routes);
