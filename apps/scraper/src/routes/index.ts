import { Hono } from 'hono';
import { health } from '../controllers/health.controller.js';

export const routes = new Hono().get('/health', health);
