# SkillBridge — POC

Interviews a student, derives their skill gaps, and returns learning resources matched to
those gaps. Resources arrive from a **scraper** (external, mocked for the POC) and an
**ingestor** (admin push). The **hub** owns the only database connection and orchestrates both.

Modelled so jobs drop in later without a re-architecture: courses and jobs share one
`resources` table split by `kind`, and scraper targets are a source file, not new plumbing.

## Architecture

```
              Next.js web :3000  ──HTTP+SSE──▶  QnA agent :3004
                                                    │  ▲
                          XADD stream:hub.requests   │  │ SUBSCRIBE qna:session:<id>
                                                    ▼  │
                                              HUB :3001  ← only DB connection
                              ┌──────────────────┴──────────────────┐
                XADD stream:scrape.requests        XREADGROUP stream:ingest.resources
                              ▼                                     ▼
                       Scraper :3002                         Ingestor :3003
                              └── XADD stream:resources.discovered ──▶ hub upserts

                        Postgres :5433(host)          Redis :6380(host)
```

The hub being the single writer buys one migration surface, one connection pool, and
back-pressure for free through consumer groups.

### Redis, all three modes

| Mode | Key | Purpose |
|---|---|---|
| Stream | `stream:hub.requests` | QnA → hub: resolve these gaps |
| Stream | `stream:scrape.requests` | hub → scraper: skills lacking coverage |
| Stream | `stream:resources.discovered` | scraper → hub: resources to upsert |
| Stream | `stream:ingest.resources` | ingestor → hub: admin-pushed resources |
| Stream | `stream:dlq` | anything that failed schema validation |
| Pub/Sub | `qna:session:<id>` | hub → QnA: recommendations ready |
| Cache | `cache:recs:<sha1(gaps)>` | gap set → recommendations, TTL 300s |
| String | `session:<id>` | QnA transcript + status, TTL 24h |

Every consumer runs in a group with `XACK`. Schema failures go to the DLQ and are acked;
handler failures stay pending and are redelivered on restart.

## Run

```sh
cp .env.example .env          # set LLM_API_KEY (Groq) for the QnA agent
docker compose up --build
pnpm smoke                    # confirms the whole path works before you open the UI
```

The model is `qwen/qwen3.8-27b` on Groq. Check `LLM_MODEL` against
`curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $LLM_API_KEY"` —
model availability differs per account.

| Service | URL |
|---|---|
| web | http://localhost:3000 |
| hub | http://localhost:3001 |
| scraper | http://localhost:3002 |
| ingestor | http://localhost:3003 |
| qna | http://localhost:3004 |

Postgres and Redis publish on **5433** and **6380** by default so they don't collide with
a locally running instance; override with `POSTGRES_PORT` / `REDIS_PORT`. Containers always
talk to each other on 5432/6379.

The hub runs migrations and the skill seed on boot — single writer, so no migration race.

## Frontend

`/` **Gap** — the interview. One question per step with a progress bar, tappable answer
chips from the model, and a free-text box that always overrides the chip. Ends on the
ranked gap meters and the courses that close them.
`/courseware` — catalogue browser: hero search, skill filter chips, and a card grid. Cards
derive their artwork from a hash of the title, since the catalogue stores no images.
`/jobs` — the same browser bound to `kind=job`. Live and querying, but the catalogue holds
no roles yet, so it shows an empty state naming what turning it on takes.
`/admin` — push a resource into the catalogue by hand.

Styling is Tailwind v4 — `app/globals.css` holds only design tokens in an `@theme` block,
and `lib/ui.ts` keeps the handful of class strings repeated across pages (as constants, not
`@apply`, so the utilities stay visible). One `ResourceCard` renders both the browse grids
and the recommendation panel; the recommendation copy passes a `rank`.

Animation is `motion`: a shared `layoutId` slides the nav pill between tabs, steps
cross-fade on a spring, chips and cards stagger in, gap meters grow from zero.
All of it collapses under `prefers-reduced-motion`.

## Layout

```
packages/shared   zod contracts, Redis client + consumeGroup, event names, logger
packages/db       drizzle schema, migrations, skill seed
apps/hub          consumers + catalogue/resolve services  (Hono)
apps/scraper      scrape.requests consumer + pluggable sources  (Hono)
apps/ingestor     admin REST → stream  (Hono)
apps/qna          seed questionnaire + LLM follow-ups + SSE  (Hono)
apps/web          SkillBridge UI — Gap / Courseware / Jobs  (Next.js + Tailwind + motion)
```

Each service follows the same shape: `routes/` → `controllers/` → `services/`, with
`consumers/` for stream work, `config.ts` for env, and `context.ts` for shared handles.

## API

```sh
# admin push (single resource or array)
curl -X POST localhost:3003/admin/resources \
  -H 'authorization: Bearer dev-admin-token' -H 'content-type: application/json' \
  -d '{"kind":"course","externalId":"internal-001","title":"…","url":"https://…",
       "provider":"…","level":"intermediate","skills":[{"slug":"system-design","weight":1}]}'

# interview — 3 fixed seed questions, then adaptive follow-ups, hard-capped at MAX_QUESTIONS
curl -X POST localhost:3004/sessions -d '{"goal":"backend internship"}'
# -> {"question":"…","options":["Never written one","Basic joins only",…],
#     "questionCount":1,"totalSteps":6}
curl -X POST localhost:3004/sessions/<id>/answer -d '{"answer":"Basic joins only"}'
curl -N localhost:3004/sessions/<id>/stream          # SSE: ready | recommendations | ping
# a late connect replays the cached result, so a page reload never loses the answer

# catalogue (debug)
curl 'localhost:3001/resources?skill=react'      # by skill
curl 'localhost:3001/resources?kind=job'         # courses vs jobs
curl localhost:3001/skills
```

## Extending

**A real scraper source** — add a file to `apps/scraper/src/sources/` exporting a `Source`
(`{ name, kind, fetch(skillSlug) }`) and list it in `sources/index.ts`. Nothing else changes.

**Jobs** — a source with `kind: 'job'`. The `resources` table, ranking, and recommendation
contract already carry `kind`; no migration needed.

## Tests

**Smoke test — run this before trusting the client.** It makes the same calls the browser
makes, in the same order, against the running stack:

```sh
pnpm smoke              # full run, drives a real interview through the LLM
pnpm smoke -- --no-llm  # everything except the interview (no API key needed)
```

Covers: five health endpoints and all four pages; skill seed; hub CORS (the Courseware page
reads the hub directly); admin push → stream → hub → Postgres, and a bad token rejected;
a bare skill forcing a scrape; a full interview — seed questions, adaptive follow-ups,
gap slugs checked against the vocabulary, recommendations over SSE, and a late reconnect
replaying from cache; and that nothing stays pending on any stream with an empty DLQ.
Exits non-zero on the first failure.

**Unit tests:**

```sh
REDIS_URL=redis://localhost:6380 pnpm --filter @sih/shared test  # consumeGroup ack/DLQ
pnpm --filter @sih/qna test                                       # <think> stripping
```
