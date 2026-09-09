import { log } from '@sih/shared';
import { config } from '../config.js';

const REFRESH_MS = 5 * 60 * 1000;
let cached: string[] = [];
let fetchedAt = 0;

/** From the hub over HTTP, not a second DB pool. Constrains gap extraction: invented slugs match nothing. */
export async function skillVocabulary(): Promise<string[]> {
  if (cached.length > 0 && Date.now() - fetchedAt < REFRESH_MS) return cached;
  try {
    const res = await fetch(`${config.hubUrl}/skills`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`hub /skills returned ${res.status}`);
    const rows = (await res.json()) as { slug: string }[];
    if (rows.length > 0) {
      cached = rows.map((r) => r.slug);
      fetchedAt = Date.now();
    }
  } catch (err) {
    // Serve stale rather than fail the interview.
    log.error({ err, stale: cached.length }, 'skill vocabulary refresh failed');
  }
  return cached;
}
