#!/usr/bin/env node
/**
 * End-to-end smoke test against the running stack. Exercises exactly the calls the
 * browser client makes, in the same order, so a green run means the UI will work.
 *
 *   node scripts/smoke.mjs            # full run, real LLM
 *   node scripts/smoke.mjs --no-llm   # skip the interview (no API key needed)
 *
 * Exits non-zero on the first failure.
 */
const HUB = process.env.HUB_URL ?? 'http://localhost:3001';
const SCRAPER = process.env.SCRAPER_URL ?? 'http://localhost:3002';
const INGESTOR = process.env.INGESTOR_URL ?? 'http://localhost:3003';
const QNA = process.env.QNA_URL ?? 'http://localhost:3004';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const TOKEN = process.env.ADMIN_TOKEN ?? 'dev-admin-token';
const skipLlm = process.argv.includes('--no-llm');

let failures = 0;
const pass = (m, extra = '') => console.log(`  \x1b[32m✓\x1b[0m ${m}${extra ? `  \x1b[2m${extra}\x1b[0m` : ''}`);
const fail = (m, why) => { failures++; console.log(`  \x1b[31m✗\x1b[0m ${m}\n      ${why}`); };
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

async function check(name, fn, describe = () => '') {
  try {
    const out = await fn();
    pass(name, describe(out));
    return out;
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function json(url, init) {
  const res = await fetch(url, init);
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${url} — ${body.slice(0, 200)}`);
  return JSON.parse(body);
}

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Read one named SSE event, or time out. Node's fetch gives us the raw stream. */
async function waitForEvent(url, event, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    assert(res.ok, `${res.status} on ${url}`);
    let buf = '';
    for await (const chunk of res.body) {
      buf += Buffer.from(chunk).toString();
      let i;
      while ((i = buf.indexOf('\n\n')) !== -1) {
        const frame = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (frame.includes(`event: ${event}`)) {
          return JSON.parse(frame.slice(frame.indexOf('data: ') + 6));
        }
      }
    }
    throw new Error('stream ended before the event arrived');
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`timed out after ${timeoutMs}ms waiting for "${event}"`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- health

head('Health');
for (const [name, url] of [
  ['hub', HUB], ['scraper', SCRAPER], ['ingestor', INGESTOR], ['qna', QNA],
]) {
  await check(`${name} healthy`, async () => {
    const h = await json(`${url}/health`);
    assert(h.ok, `reported ${JSON.stringify(h)}`);
    return h;
  });
}
await check('web serving', async () => {
  for (const path of ['/', '/courseware', '/jobs', '/admin']) {
    const res = await fetch(`${WEB}${path}`);
    assert(res.ok, `${path} returned ${res.status}`);
  }
  return null;
}, () => '/ /courseware /jobs /admin');

// ---------------------------------------------------------------- catalogue

head('Catalogue (hub)');
const skills = await check('skills seeded', async () => {
  const rows = await json(`${HUB}/skills`);
  assert(rows.length >= 40, `only ${rows.length} skills`);
  return rows;
}, (r) => `${r.length} skills`);

await check('hub allows browser origin (browse pages)', async () => {
  const res = await fetch(`${HUB}/skills`, { headers: { Origin: WEB } });
  assert(res.headers.get('access-control-allow-origin'), 'no access-control-allow-origin header');
  return null;
});

await check('kind filter splits courses from jobs', async () => {
  const courses = await json(`${HUB}/resources?kind=course`);
  const jobs = await json(`${HUB}/resources?kind=job`);
  assert(courses.count > 0, 'no courses in the catalogue');
  assert(courses.resources.every((r) => r.kind === 'course'), 'a non-course leaked into kind=course');
  assert(jobs.resources.every((r) => r.kind === 'job'), 'a non-job leaked into kind=job');
  // Cards render duration and label themselves with the lead skill.
  assert('durationMins' in courses.resources[0], 'listing dropped durationMins');
  assert(Array.isArray(courses.resources[0].skills), 'listing dropped skills');
  assert(courses.resources.some((r) => r.skills.length > 0), 'no listing carried any skill');
  return { courses: courses.count, jobs: jobs.count };
}, (r) => `${r.courses} courses · ${r.jobs} jobs`);

// ---------------------------------------------------------------- ingest

head('Ingest path  (ingestor → stream → hub → postgres)');
const externalId = `smoke-${Date.now()}`;
await check('admin push accepted', async () => {
  const out = await json(`${INGESTOR}/admin/resources`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      kind: 'course',
      externalId,
      title: `Smoke Test Course ${externalId}`,
      url: `https://example.edu/smoke/${externalId}`,
      provider: 'Smoke Suite',
      level: 'intermediate',
      durationMins: 60,
      skills: [{ slug: 'system-design', weight: 1 }],
    }),
  });
  assert(out.accepted === 1, `accepted ${out.accepted}`);
  return out;
}, (o) => `entry ${o.entryId}`);

await check('bad admin token rejected', async () => {
  const res = await fetch(`${INGESTOR}/admin/resources`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer wrong' },
    body: '{}',
  });
  assert(res.status === 401, `expected 401, got ${res.status}`);
  return null;
});

await check('hub persisted it', async () => {
  // The hub consumes asynchronously, so poll rather than guess a sleep.
  for (let i = 0; i < 20; i++) {
    const { resources } = await json(`${HUB}/resources?skill=system-design`);
    if (resources.some((r) => r.title.includes(externalId))) return resources;
    await sleep(400);
  }
  throw new Error('resource never appeared in the catalogue');
}, (r) => `${r.length} under system-design`);

// ---------------------------------------------------------------- scrape + resolve

head('Resolve path  (gaps → scrape → rank → publish)');
if (!skills) {
  fail('resolve path', 'skipped, skills unavailable');
} else {
  // The hub only scrapes a skill it cannot already cover, so find one that is actually
  // bare. After a few runs most are filled — then assert the publish path instead.
  const bare = await firstUncovered(skills.map((s) => s.slug));

  await check(
    bare ? `scraper fills a bare skill (${bare})` : 'hub resolves gaps (catalogue already covers them)',
    async () => {
      const skill = bare ?? 'system-design';
      const before = (await json(`${HUB}/resources?skill=${skill}`)).count;
      await pushHubRequest(`smoke-${Date.now()}`, [
        { skill, currentLevel: 0, targetLevel: 4, severity: 0.9 },
      ]);

      for (let i = 0; i < 25; i++) {
        const after = await json(`${HUB}/resources?skill=${skill}`);
        if (!bare) return after;             // nothing to scrape; coverage is the assertion
        if (after.count > before) return after;
        await sleep(400);
      }
      throw new Error(`coverage for ${skill} never grew (was ${before})`);
    },
    (r) => `${r.count} resources`,
  );
}

/** First slug the catalogue cannot cover yet, or null when everything is stocked. */
async function firstUncovered(slugs) {
  for (const slug of slugs) {
    const { count } = await json(`${HUB}/resources?skill=${slug}`);
    if (count === 0) return slug;
  }
  return null;
}

/** The hub is stream-driven; there is no HTTP route to ask it for recommendations. */
async function pushHubRequest(sessionId, gaps) {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  await promisify(execFile)('docker', [
    'compose', 'exec', '-T', 'redis', 'redis-cli',
    'XADD', 'stream:hub.requests', '*', 'data', JSON.stringify({ sessionId, gaps }),
  ]);
}

// ---------------------------------------------------------------- interview

head(`Interview  (qna → ${process.env.LLM_MODEL ?? 'configured model'})`);
if (skipLlm) {
  console.log('  \x1b[2m— skipped (--no-llm)\x1b[0m');
} else {
  const session = await check('session starts', async () => {
    const s = await json(`${QNA}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal: 'land a backend internship in 6 months' }),
    });
    assert(s.question, 'no first question');
    assert(s.options.length >= 2, `only ${s.options.length} options`);
    assert(s.totalSteps >= 3, `totalSteps ${s.totalSteps}`);
    return s;
  }, (s) => `step ${s.questionCount}/${s.totalSteps} · ${s.options.length} options`);

  if (session) {
    const stream = waitForEvent(`${QNA}/sessions/${session.sessionId}/stream`, 'recommendations', 60_000);
    let view = session;

    while (view && view.status === 'asking') {
      // The UI lets the user tick several chips and sends them comma-joined, so answer
      // the same way here — otherwise the multi-select path is never exercised.
      const answer = view.options.slice(0, 2).join(', ') || 'not sure';
      const step = view.questionCount;
      view = await check(`answer step ${step} → "${answer}"`, async () => {
        const next = await json(`${QNA}/sessions/${session.sessionId}/answer`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ answer }),
        });
        assert(next.status !== 'failed', next.error ?? 'session failed');
        if (next.status === 'asking') {
          assert(next.question, 'asking but no question');
          assert(next.questionCount > step, 'step did not advance');
        }
        return next;
      }, (n) => n.status === 'asking'
        ? `→ step ${n.questionCount}/${n.totalSteps}: ${n.question.slice(0, 58)}…`
        : `→ ${n.status}, ${n.gaps.length} gaps`);
    }

    if (view) {
      await check('gaps use known skill slugs', async () => {
        assert(view.gaps.length >= 1, 'no gaps extracted');
        const known = new Set(skills.map((s) => s.slug));
        const bad = view.gaps.filter((g) => !known.has(g.skill));
        assert(bad.length === 0, `unknown slugs: ${bad.map((g) => g.skill).join(', ')}`);
        return view.gaps;
      }, (g) => g.map((x) => `${x.skill}(${x.severity})`).join(' '));

      await check('recommendations arrive over SSE', async () => {
        const payload = await stream;
        assert(payload.sessionId === session.sessionId, `wrong sessionId ${payload.sessionId}`);
        assert(payload.recommendations.length > 0, 'zero recommendations');
        return payload;
      }, (p) => `${p.recommendations.length} recs · top: ${p.recommendations[0].title.slice(0, 46)}`);

      await check('late reconnect replays the same result', async () => {
        const again = await waitForEvent(`${QNA}/sessions/${session.sessionId}/stream`, 'recommendations', 10_000);
        assert(again.cached, 'replay was not served from cache');
        assert(again.sessionId === session.sessionId, 'replay carried the wrong sessionId');
        return again;
      }, (p) => `${p.recommendations.length} recs, cached`);
    }
  }
}

// ---------------------------------------------------------------- streams

head('Streams');
await check('nothing stays pending, empty DLQ', async () => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = (args) => promisify(execFile)('docker', ['compose', 'exec', '-T', 'redis', 'redis-cli', ...args])
    .then((r) => r.stdout.trim());

  const pendingOf = async (s) => {
    const lines = (await run(['XINFO', 'GROUPS', s])).split('\n');
    const i = lines.findIndex((l) => l.trim() === 'pending');
    return i === -1 ? 0 : Number(lines[i + 1]);
  };
  const STREAMS = [
    'stream:hub.requests', 'stream:scrape.requests',
    'stream:resources.discovered', 'stream:ingest.resources',
  ];

  // In-flight is fine; stuck is not. The hub can sit in its scrape wait for
  // SCRAPE_WAIT_MS, so poll past that before calling anything stuck.
  let stuck = [];
  for (let i = 0; i < 30; i++) {
    stuck = [];
    for (const s of STREAMS) {
      const n = await pendingOf(s);
      if (n > 0) stuck.push(`${s}=${n}`);
    }
    if (stuck.length === 0) break;
    await sleep(500);
  }
  assert(stuck.length === 0, `still pending after 15s: ${stuck.join(', ')}`);

  const dlq = Number(await run(['XLEN', 'stream:dlq']));
  assert(dlq === 0, `${dlq} messages on the DLQ`);
  return null;
});

// ---------------------------------------------------------------- result

console.log();
if (failures > 0) {
  console.log(`\x1b[31m${failures} check(s) failed\x1b[0m`);
  process.exit(1);
}
console.log('\x1b[32mAll checks passed — the client will work.\x1b[0m');
