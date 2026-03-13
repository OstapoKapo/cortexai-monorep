# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY shared/ ./shared/
COPY client/ ./client/

# Install dependencies
RUN npm install

# Build shared package
RUN npm run build --workspace=shared

# Build client
WORKDIR /app/client

ENV NEXT_TELEMETRY_DISABLED=1

# Gateway URL for auth (login/register) - direct, no proxy
ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/client/public ./public

# Copy standalone output (includes node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/client/.next/static ./client/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# In monorepo, server.js is in the client subdirectory
CMD ["node", "client/server.js"]
