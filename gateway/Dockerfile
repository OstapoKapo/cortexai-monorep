# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY shared/ ./shared/
COPY backend-common/ ./backend-common/
COPY gateway/ ./gateway/

# Install dependencies
RUN npm install

# Build shared packages first
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend-common

# Build gateway service
WORKDIR /app/gateway
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy built shared packages (workspace dependencies)
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend-common ./backend-common

# Copy built application
COPY --from=builder /app/gateway/dist ./dist
COPY --from=builder /app/gateway/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main.js"]
