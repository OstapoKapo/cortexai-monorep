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
COPY auth/ ./auth/

# Install dependencies
RUN npm install

# Build shared packages first
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend-common

# Build auth service
RUN npm run build --workspace=auth

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
COPY --from=builder /app/auth/dist ./dist
COPY --from=builder /app/auth/src/db ./src/db
COPY --from=builder /app/auth/package.json ./package.json

EXPOSE 3002

CMD ["node", "dist/main.js"]
