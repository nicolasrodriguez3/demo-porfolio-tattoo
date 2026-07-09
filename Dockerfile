FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml package.json ./
RUN pnpm approve-builds esbuild sharp
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm astro build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
