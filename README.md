# 🧠 CortexAI: Intelligent RAG Admin Platform

**CortexAI** is an enterprise-grade analytics dashboard and reporting platform powered by **Retrieval-Augmented Generation (RAG)**. It leverages a modern monorepo architecture to deliver real-time AI insights, automated reporting, and scalable background processing.

![CI Status](https://github.com/OstapoKapo/cortexai-monorep/actions/workflows/ci.yml/badge.svg)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-blue)
![Stack](https://img.shields.io/badge/Stack-Next.js_|_NestJS_|_AWS-black)

## 📖 About The Project

CortexAI is designed to solve the problem of complex data interpretation. It acts as an intelligent layer between raw data and administrative decision-making.

**Key Capabilities:**
* **RAG-Powered Q&A:** Administrators can ask natural language questions about their data and receive accurate answers based on indexed reports.
* **Automated Reporting:** Background workers generate heavy analytical reports without freezing the UI.
* **Event-Driven Architecture:** Uses RabbitMQ to handle high loads and asynchronous tasks (e.g., AI inference, PDF generation).
* **Serverless Scalability:** Resource-intensive tasks are offloaded to **AWS Lambda**.

## 🏗 System Architecture

The project follows a **Monorepo** structure managed by NPM Workspaces:

```mermaid
graph TD
    Client[Next.js Client] -->|HTTP/REST| API[NestJS API Gateway]
    API -->|Produce Events| MQ[RabbitMQ]
    MQ -->|Consume Events| Workers[NestJS Workers]
    Workers -->|Invoke| Lambda[AWS Lambda]
    Workers -->|Read/Write| DB[(PostgreSQL)]
    Workers -->|Vector Search| VectorDB[(Vector Store)]
🛠 Tech Stack🖥 Client (Frontend)Framework: Next.js 16 (App Router)Language: TypeScriptStyling: Tailwind CSS v4, Shadcn/UIState: React Query, ZustandBuild Tool: Turbopack⚙️ Server (Backend & Microservices)Core Framework: NestJS (Modular Architecture)Messaging: RabbitMQ (Microservices communication)Database: PostgreSQL (Primary storage)ORM: TypeORM / PrismaValidation: Zod (Shared DTOs with Client)☁️ Cloud & AI (Infrastructure)Compute: AWS Lambda (Serverless functions)AI Integration: OpenAI API / LangChain (RAG Pipeline)Storage: AWS S3 (Report artifacts)DevOps: Docker, Docker Compose, GitHub Actions📂 Project StructurePlaintextCortexAI/
├── client/          # Next.js Dashboard (Admin Panel)
├── back/            # NestJS API Gateway & Workers
├── shared/          # Shared Types, Zod Schemas, Utils
├── docker-compose.yml # Local infra (Postgres, RabbitMQ)
└── .github/         # CI/CD Workflows
🚀 Getting StartedPrerequisitesNode.js (v20+)Docker & Docker Compose (for DB and RabbitMQ)1. Clone & InstallBashgit clone [https://github.com/OstapoKapo/cortexai-monorep.git](https://github.com/OstapoKapo/cortexai-monorep.git)
cd cortexai-monorep
npm install
2. Infrastructure SetupStart PostgreSQL and RabbitMQ locally using Docker:Bashdocker-compose up -d
3. Environment VariablesCreate .env files in client/ and back/ based on .env.example.Ensure you configure:DATABASE_URLRABBITMQ_URIAWS_ACCESS_KEY_ID (for Lambda/S3)OPENAI_API_KEY (for RAG)4. Run Development ModeStart the entire stack (Client + Server):Bashnpm run dev
Client: http://localhost:3000API: http://localhost:3001RabbitMQ Dashboard: http://localhost:15672🧪 ScriptsCommandDescriptionnpm run buildBuild client, server, and shared packagesnpm run lintRun ESLint across the monoreponpm run checkFull type-check and build verificationnpm testRun unit tests🤝 ContributionThis project uses Husky for pre-commit checks.Branching: Use feature branches (feature/rag-pipeline).Commits: Follow Conventional Commits (feat: add rabbitmq consumer).Author: @OstapoKapo