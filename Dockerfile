# ── Stage 1: build React client ─────────────────────────────────────────────
FROM node:22-alpine AS client-builder

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


# ── Stage 2: production server ───────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Only install production dependencies for the server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist
RUN chown -R node:node /app

ENV NODE_ENV=production \
    PORT=3001

USER node

EXPOSE 3001

CMD ["node", "server/index.js"]
