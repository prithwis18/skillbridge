import { STREAMS, xaddJson, log, type SessionState, type RedisClient } from '@sih/shared';
import { config } from '../config.js';
import { extractGaps, nextQuestion } from '../llm/index.js';
import { createSession, loadSession, save } from './session.store.js';

export class SessionNotFound extends Error {}
export class SessionClosed extends Error {}

export type Turn = { state: SessionState; question: string | null; options: string[] };

/**
 * Fixed opener. Same three questions for everyone: no LLM call, no latency, and the model
 * gets a concrete profile to aim its follow-ups at instead of guessing from a goal string.
 */
const SEED: { question: string; options: string[] }[] = [
  {
    question: 'Where are you right now?',
    options: ['Still studying', 'Just graduated', '1-2 years working', 'Switching fields'],
  },
  {
    question: 'Which area is closest to what you want to do?',
    options: ['Frontend', 'Backend', 'Data & ML', 'DevOps & cloud'],
  },
  {
    question: 'How solid are your programming fundamentals?',
    options: ['Just starting', 'Can build small things', 'Comfortable', 'Strong'],
  },
];

export async function start(redis: RedisClient, goal: string): Promise<Turn> {
  const state = await createSession(redis, goal);
  return ask(redis, state);
}

export async function answer(redis: RedisClient, id: string, text: string): Promise<Turn> {
  const state = await loadSession(redis, id);
  if (!state) throw new SessionNotFound(id);
  if (state.status !== 'asking') throw new SessionClosed(state.status);

  state.turns.push({ role: 'user', content: text });
  await save(redis, state);
  return ask(redis, state);
}

/** Seed question, then an adaptive follow-up, then gap extraction. */
async function ask(redis: RedisClient, state: SessionState): Promise<Turn> {
  const seed = SEED[state.questionCount];
  if (seed) return record(redis, state, seed.question, seed.options);

  const remaining = config.maxQuestions - state.questionCount;
  if (remaining <= 0) return finish(redis, state);

  const out = await nextQuestion(state.goal, state.turns, remaining);
  if (out.done || !out.question) return finish(redis, state);
  return record(redis, state, out.question, out.options);
}

async function record(
  redis: RedisClient,
  state: SessionState,
  question: string,
  options: string[],
): Promise<Turn> {
  state.turns.push({ role: 'assistant', content: question });
  state.questionCount += 1;
  state.options = options;
  await save(redis, state);
  return { state, question, options };
}

/** Extract gaps, hand off to hub. Recommendations return async on the session channel; SSE forwards them. */
async function finish(redis: RedisClient, state: SessionState): Promise<Turn> {
  try {
    state.gaps = await extractGaps(state.goal, state.turns);
    state.status = 'resolving';
    state.options = [];
    await save(redis, state);
    await xaddJson(redis, STREAMS.hubRequests, { sessionId: state.id, gaps: state.gaps });
    log.info({ sessionId: state.id, gaps: state.gaps.length }, 'gaps sent to hub');
  } catch (err) {
    state.status = 'failed';
    state.error = err instanceof Error ? err.message : 'gap extraction failed';
    await save(redis, state);
    log.error({ sessionId: state.id, err }, 'gap extraction failed');
  }
  return { state, question: null, options: [] };
}
