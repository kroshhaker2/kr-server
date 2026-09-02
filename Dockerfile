FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS build

COPY . .

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    pnpm prisma generate && \
    pnpm build


FROM node:24-alpine AS production

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

RUN corepack enable

COPY --chown=app:app package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production

COPY --chown=app:app --from=build /app/dist ./dist
COPY --chown=app:app --from=build /app/src/generated ./src/generated
COPY --chown=app:app --from=build /app/prisma ./prisma
COPY --chown=app:app --from=build /app/prisma.config.ts ./prisma.config.ts

USER app

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]