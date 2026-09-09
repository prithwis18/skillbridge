# Lessons

## Structure services as routes → controllers → services from the start

**Correction:** mid-build, asked to separate routes and controllers rather than defining
handlers inline in `index.ts`.

**Why:** an inline Hono app mixes routing, validation, business logic and bootstrap in one
file. It reads fine at 60 lines and becomes unpickable at 200, and it makes the handler
untestable without booting the server.

**How to apply:** for any Hono/Express service, scaffold the directories before writing the
first handler — `routes/` (paths + middleware only), `controllers/` (HTTP in, HTTP out),
`services/` (logic, no `Context`), plus `config.ts` for env and `context.ts` for shared
handles. `index.ts` does nothing but boot and shut down. Do this even for a POC.

## Comments earn their place; compress the rest

**Correction:** asked to compress comments down after the first pass.

**Why:** multi-line block comments restating what the code already says are noise. What is
worth writing down is the non-obvious *why* — a constraint, a trade-off, a footgun.

**How to apply:** one line unless the reasoning genuinely needs more. Drop articles and
filler. Delete any comment that a reader could reconstruct from the signature.
