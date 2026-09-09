import { Hono } from 'hono';
import { health } from '../controllers/health.controller.js';
import { getResources, getSkills } from '../controllers/catalogue.controller.js';

// Hub is stream-driven; HTTP exists for health and read-only catalogue views.
export const routes = new Hono()
  .get('/health', health)
  .get('/resources', getResources)
  .get('/skills', getSkills);
