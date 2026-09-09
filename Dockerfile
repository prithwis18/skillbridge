# One image definition for every Node service. ARG APP picks which workspace to run.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/hub/package.json apps/hub/
COPY apps/scraper/package.json apps/scraper/
COPY apps/ingestor/package.json apps/ingestor/
COPY apps/qna/package.json apps/qna/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG APP
# Next inlines NEXT_PUBLIC_* at build time, so they must be present in this stage.
ARG NEXT_PUBLIC_QNA_URL=http://localhost:3004
ARG NEXT_PUBLIC_INGESTOR_URL=http://localhost:3003
ARG NEXT_PUBLIC_HUB_URL=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_QNA_URL=$NEXT_PUBLIC_QNA_URL \
    NEXT_PUBLIC_INGESTOR_URL=$NEXT_PUBLIC_INGESTOR_URL \
    NEXT_PUBLIC_HUB_URL=$NEXT_PUBLIC_HUB_URL
COPY . .
RUN pnpm --filter "@sih/${APP}..." build

FROM build AS runtime
ARG APP
ENV NODE_ENV=production SERVICE_NAME=${APP}
WORKDIR /repo/apps/${APP}
CMD ["pnpm", "start"]
