import type { Context } from 'hono';
import { z } from 'zod';
import { log, type SessionState } from '@sih/shared';
import { config } from '../config.js';
import { redis } from '../context.js';
import { SessionClosed, SessionNotFound, answer, start } from '../services/interview.js';
import { loadSession } from '../services/session.store.js';

/** Route always supplies :id; the empty fallback just falls through to a 404. */
const sessionId = (c: Context) => c.req.param('id') ?? '';

const StartBody = z.object({ goal: z.string().max(500).default('') });
const AnswerBody = z.object({ answer: z.string().min(1).max(2000) });

/** Never leak the whole transcript back; the client already has its own copy. */
const view = (state: SessionState, question: string | null, options: string[]) => ({
  sessionId: state.id,
  status: state.status,
  question,
  options,
  questionCount: state.questionCount,
  totalSteps: config.maxQuestions,
  gaps: state.gaps,
  error: state.error,
});

export async function postSession(c: Context) {
  const body = StartBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: 'validation failed', issues: body.error.issues }, 400);

  try {
    const turn = await start(redis, body.data.goal);
    return c.json(view(turn.state, turn.question, turn.options), 201);
  } catch (err) {
    log.error({ err }, 'session start failed');
    return c.json({ error: 'could not start session' }, 502);
  }
}

export async function postAnswer(c: Context) {
  const body = AnswerBody.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: 'validation failed', issues: body.error.issues }, 400);

  try {
    const turn = await answer(redis, sessionId(c), body.data.answer);
    return c.json(view(turn.state, turn.question, turn.options));
  } catch (err) {
    if (err instanceof SessionNotFound) return c.json({ error: 'session not found' }, 404);
    if (err instanceof SessionClosed) return c.json({ error: `session is ${err.message}` }, 409);
    log.error({ err }, 'answer failed');
    return c.json({ error: 'could not process answer' }, 502);
  }
}

export async function getSession(c: Context) {
  const state = await loadSession(redis, sessionId(c));
  if (!state) return c.json({ error: 'session not found' }, 404);
  const lastQuestion = [...state.turns].reverse().find((t) => t.role === 'assistant');
  return c.json({
    ...view(state, lastQuestion?.content ?? null, state.options),
    turns: state.turns,
  });
}
