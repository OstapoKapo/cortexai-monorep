# CortexAI

Automated report generation platform for students. Stop wasting time on formatting — focus on what matters.

## About

CortexAI helps students generate properly formatted academic reports automatically. Upload your data, select a template, and get a ready-to-submit document.

## Architecture

Monorepo with microservices architecture using Turborepo:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Gateway   │────▶│    Auth     │
│  (Next.js)  │     │  (NestJS)   │     │  (NestJS)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐     ┌─────────────┐
                   │   Reports   │────▶│     SQS     │
                   │  (NestJS)   │     └──────┬──────┘
                   └──────┬──────┘            │
                          │                   ▼
                          ▼            ┌─────────────┐
                   ┌─────────────┐     │   Lambda    │
                   │     S3      │◀────│ (Generate)  │
                   │ (Templates) │     └─────────────┘
                   └─────────────┘
```

| Service | Port | Description |
|---------|------|-------------|
| client | 3000 | Next.js frontend |
| gateway | 3001 | API Gateway, routes requests |
| auth | 3002 | Authentication, JWT tokens |
| report-service | 3003 | Report management, templates stored in S3, generation via SQS + Lambda |

## Tech Stack

**Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript

**Backend:** NestJS, Prisma, PostgreSQL, Redis

**Shared:** Zod schemas, TypeScript types (shared between client & server)

**Infrastructure:** Docker, Turborepo

**AWS:** S3 (template storage), SQS (job queue), Lambda (report generation)

## Project Structure

```
cortexai-monorep/
├── client/           # Next.js frontend
├── gateway/          # API Gateway
├── auth/             # Auth microservice
├── report-service/   # Reports microservice
├── shared/           # Shared types, schemas, constants
├── backend-common/   # Shared backend utilities
└── docker-compose.yaml
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Option 1: Docker (Recommended)

Run the entire stack with one command:

```bash
git clone https://github.com/OstapoKapo/cortexai-monorep.git
cd cortexai-monorep

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec auth npx prisma migrate deploy
```

Access:
- Client: http://localhost:3000
- Gateway API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api

### Option 2: Local Development

#### 1. Clone & Install

```bash
git clone https://github.com/OstapoKapo/cortexai-monorep.git
cd cortexai-monorep
npm install
```

#### 2. Start Infrastructure

```bash
docker-compose up db redis -d
```

#### 3. Environment Variables

Create `.env` files in `auth/` and `gateway/`:

```env
# auth/.env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cortexai-users-db"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# gateway/.env
AUTH_SERVICE_URL="http://localhost:3002"
```

#### 4. Run Migrations

```bash
cd auth
npx prisma migrate dev
npx prisma generate
```

#### 5. Start Dev Servers

```bash
# From root
npm run dev
```

- Client: http://localhost:3000
- Gateway: http://localhost:3001
- Auth: http://localhost:3002

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh tokens |
| GET | `/auth/me` | Get current user |

## License

MIT