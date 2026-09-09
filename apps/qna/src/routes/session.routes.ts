import { Hono } from 'hono';
import { getSession, postAnswer, postSession } from '../controllers/session.controller.js';
import { streamSession } from '../controllers/stream.controller.js';

export const sessionRoutes = new Hono()
  .post('/', postSession)
  .get('/:id', getSession)
  .post('/:id/answer', postAnswer)
  .get('/:id/stream', streamSession);
