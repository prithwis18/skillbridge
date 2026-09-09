import { Hono } from 'hono';
import { health } from '../controllers/health.controller.js';
import { sessionRoutes } from './session.routes.js';

export const routes = new Hono()
  .get('/health', health)
  .route('/sessions', sessionRoutes);
