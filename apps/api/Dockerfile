# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --prod --filter @adamjobs/api...

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/tsconfig.json apps/api/tsconfig.json
COPY apps/api/src apps/api/src
RUN pnpm install --filter @adamjobs/api...
RUN pnpm --filter @adamjobs/api build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY package.json pnpm-workspace.yaml ./
EXPOSE 8781
CMD ["node", "apps/api/dist/server.js"]
