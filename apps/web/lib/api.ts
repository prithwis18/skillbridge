import { HUB_URL, QNA_URL } from './config';
import type { CatalogueResource, SessionView, Skill } from './types';

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${(await res.text().catch(() => '')).slice(0, 180)}`);
  return res.json() as Promise<T>;
}

const post = <T,>(path: string, body: unknown) =>
  json<T>(`${QNA_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

export const startSession = (goal: string) => post<SessionView>('/sessions', { goal });

export const sendAnswer = (sessionId: string, answer: string) =>
  post<SessionView>(`/sessions/${sessionId}/answer`, { answer });

export const streamUrl = (sessionId: string) => `${QNA_URL}/sessions/${sessionId}/stream`;

export const fetchResources = (opts: { skill?: string; kind?: string } = {}) => {
  const q = new URLSearchParams();
  if (opts.skill) q.set('skill', opts.skill);
  if (opts.kind) q.set('kind', opts.kind);
  const suffix = q.toString();
  return json<{ count: number; resources: CatalogueResource[] }>(
    `${HUB_URL}/resources${suffix ? `?${suffix}` : ''}`,
  );
};

export const fetchSkills = () => json<Skill[]>(`${HUB_URL}/skills`);
