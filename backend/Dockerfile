# ─── Stage 1: Build ──────────────────────────────────────────────────────────
# Compile TypeScript to JavaScript in a full Node image with dev dependencies
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (Docker layer caching — only reinstalls if deps change)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like TypeScript)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript → JavaScript
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
# Run the compiled JS in a minimal image (no TypeScript, no dev deps)
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from build stage
COPY --from=build /app/dist ./dist

# Preload shim (SlowBuffer polyfill for Node 25+) — must load before the app
COPY src/preload.cjs ./preload.cjs

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 8000

# Health check — matches our /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/v1/health || exit 1

# Start the application (preload shim matches the npm start script)
CMD ["node", "--require", "./preload.cjs", "dist/index.js"]
