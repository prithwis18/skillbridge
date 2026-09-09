import { Hono } from 'hono';
import { requireAdmin } from '../middleware/auth.js';
import { postResources } from '../controllers/resources.controller.js';

export const adminRoutes = new Hono()
  .use('*', requireAdmin)
  .post('/resources', postResources);
