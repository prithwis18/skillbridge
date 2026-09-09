# Skill Gap Engine — POC build

## Done

- [x] Turborepo + pnpm workspace, root tsconfig/Dockerfile/compose
- [x] `packages/shared` — zod contracts, event names, `consumeGroup`, logger, env, gap hash
- [x] `packages/db` — drizzle schema (skills / resources / resource_skills), migration, 48-skill seed
- [x] `apps/hub` — 3 stream consumers, upsert, coverage check, ranking, cache, publish
- [x] `apps/ingestor` — admin REST → `stream:ingest.resources`, bearer auth
- [x] `apps/scraper` — `scrape.requests` consumer, pluggable sources, fixture source
- [x] `apps/qna` — LLM interview loop, gap extraction, SSE
- [x] `apps/web` — Next.js chat UI + admin push form
- [x] Docker compose: postgres, redis, 5 services, healthchecks, migrate+seed on hub boot
- [x] Routes / controllers / services split across every service
- [x] Ponytail audit + comment compression pass
- [x] Second ponytail pass — six cuts applied (log overload, runScrape return, dead type
      aliases, NextQuestion export, Dockerfile install fallback, env fallback)
- [x] SkillBridge client — Gap / Courseware / Jobs, motion animations, chip answers
- [x] Interview returns suggested answers (`options[]`) + `totalSteps` for the step UI
- [x] Qwen (`qwen/qwen3-32b`) + 5-step cap: 3 fixed seed questions, then adaptive follow-ups

## Verification (all run against the containerised stack)

- [x] All six healthchecks green from a clean `docker compose up --build`
- [x] Ingest path: `POST /admin/resources` → stream → hub → Postgres row + 2 skill links
- [x] Bad admin token → 401
- [x] Full resolve path: gaps → coverage miss → scrape → upsert → rank → publish (6 recs)
- [x] Admin-ingested course ranks alongside scraped ones
- [x] Cache: identical gap set on a second session logged `cache hit, skipping db + scrape`
- [x] Crash recovery: scraper stopped, request queued (lag 1), restarted → consumed, lag 0
- [x] `pending 0 / lag 0` across all four streams, DLQ empty
- [x] `consumeGroup` test: acks on success, DLQs schema failures
- [x] QnA fails cleanly (502) on a bad LLM key rather than hanging

## Review

Built as planned. Eight changes worth naming:

1. **`sessions` table dropped.** Session state lives in Redis with a 24h TTL and nothing
   read the Postgres copy — it was dead on arrival. Caught in the ponytail audit.
2. **`consumeGroup` owns its connection.** A blocked `XREADGROUP` ignores an AbortSignal,
   so shutdown hung. It now disconnects on abort and closes the connection in a `finally`.
   The shared test caught this; the services would have masked it behind `process.exit`.
3. **Cache no longer stores `sessionId`.** Caught while testing SSE replay: the cached
   payload embedded whichever session first produced it, so a cache hit published another
   session's id. The cache now holds `{gaps, recommendations}` and the id is stamped per
   delivery — the wrong-id path is gone rather than patched in two places.
4. **SSE replays a cached result on connect.** Pub/sub is ephemeral, so a client that
   subscribed after the hub published (page reload, slow connect) waited forever. The hub
   had already cached the answer; the stream route now replays it.
5. **`<think>` stripping, not brace-scanning.** qwen3 prefixes its answer with a reasoning
   block that routinely contains braces — drafts of the JSON it is about to write. Slicing
   to the first `{` lands inside that reasoning and fails both retries. `extractJson` strips
   the think blocks first; `apps/qna/src/llm/client.test.ts` covers the brace-in-think case.
6. **Model corrected to `qwen/qwen3.8-27b`.** `qwen/qwen3-32b` returns "does not exist or
   you do not have access" on this account; `qwen3.6-27b` exceeds its output-tokens/min
   tier. Listing `/v1/models` with the key is the way to check.
7. **Catalogue listings carry their skills.** Cards label themselves with the skill they
   cover, so `/resources` now attaches slugs — one extra query for the page, not one per
   card, sorted heaviest-first so the lead label is the skill the resource covers best.
8. **Host ports moved to 5433/6380.** A local Postgres/Redis already held 5432/6379.
   Configurable via `POSTGRES_PORT` / `REDIS_PORT`; container-to-container is unchanged.

## Not done / next

- [ ] Real scraper sources (fixtures only). One file in `apps/scraper/src/sources/`.
- [ ] Jobs. Schema and contracts already carry `kind`; needs a `kind: 'job'` source.
- [ ] `resolve.ts` polls Postgres for coverage instead of taking a done-signal from the
      scraper (`ponytail:` marked). Fine at POC volume.
- [ ] No auth on QnA sessions — anonymous by decision.
- [ ] Jobs page is an honest placeholder; needs a `kind: 'job'` scraper source.
- [ ] No "Back" through answered questions — the QnA service has no undo. The UI offers
      "Start over" instead of faking it.
- [ ] Recommendations are keyword-weighted, not semantic. pgvector is the upgrade path.
