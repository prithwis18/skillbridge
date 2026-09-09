import { Hono } from 'hono';
import { health } from '../controllers/health.controller.js';
import { adminRoutes } from './admin.routes.js';

export const routes = new Hono()
  .get('/health', health)
  .route('/admin', adminRoutes);
