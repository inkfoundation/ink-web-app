# Build
FROM node:20 AS base

WORKDIR /app

RUN npm i -g pnpm@9.12.1

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Bake the git commit SHA into the build so it can be surfaced in the rendered
# HTML (see `data-version` in `src/app/[locale]/layout.tsx`). Passed in from CI.
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

RUN pnpm build

# Run
FROM node:20-alpine3.19 AS release

WORKDIR /app

RUN npm i -g pnpm@9.12.1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=base --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=base --chown=nextjs:nodejs /app/.next ./.next
COPY --from=base --chown=nextjs:nodejs /app/public ./public

USER nextjs

CMD ["pnpm", "start"]
