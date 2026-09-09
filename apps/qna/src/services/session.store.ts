import { randomUUID } from 'node:crypto';
import { sessionKey, SESSION_TTL_SECONDS, SessionState, type RedisClient } from '@sih/shared';

/** Session state lives in Redis only — the hub owns Postgres. */
export async function createSession(redis: RedisClient, goal: string): Promise<SessionState> {
  const state: SessionState = {
    id: randomUUID(), status: 'asking', goal, turns: [], questionCount: 0, options: [], gaps: [],
  };
  await save(redis, state);
  return state;
}

export async function loadSession(redis: RedisClient, id: string): Promise<SessionState | null> {
  const raw = await redis.get(sessionKey(id));
  if (!raw) return null;
  const parsed = SessionState.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export async function save(redis: RedisClient, state: SessionState): Promise<void> {
  await redis.set(sessionKey(state.id), JSON.stringify(state), 'EX', SESSION_TTL_SECONDS);
}
