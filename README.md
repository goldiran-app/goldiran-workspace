# Goldiran Workspace

Lightweight Go and Next.js monorepo for managing **projects**, **initiatives**, and **issues**.

Initiatives can contain projects. Projects can contain issues. The UI is intentionally simple, fast, and RTL-ready. Auth, permissions, notifications, and integrations are out of scope for this starter.

## Stack

- Backend: Go, Chi, PostgreSQL, SQL migrations
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, pnpm
- Local development: Docker Compose

## Repository structure

```text
apps/api          Go API, migrations, and tests
apps/web          Next.js app
infra             Notes for local infrastructure
docker-compose.yml
```

## Prerequisites

- Docker and Docker Compose
- Optional for local (non-Docker) development:
  - Go 1.23+
  - Node.js 22+
  - pnpm 9
  - PostgreSQL 16

## Local setup with Docker

```bash
docker compose up --build
```

Then open:

- Web: http://localhost:3000
- API health: http://localhost:8080/health

Compose starts PostgreSQL, runs API migrations and seed data on boot, then starts the frontend.

## Environment configuration

Copy the example files if you run services outside Docker:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Where | Default |
| --- | --- | --- |
| `DATABASE_URL` | API | `postgres://goldiran:goldiran@localhost:5432/goldiran?sslmode=disable` |
| `HTTP_ADDR` | API | `:8080` |
| `CORS_ORIGIN` | API | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Web (browser) | `http://localhost:8080` |
| `API_URL` | Web (server) | `http://localhost:8080` locally, `http://api:8080` in Compose |

Do not commit `.env` files.

## Local setup without Docker

1. Start PostgreSQL and create database `goldiran`.
2. From `apps/api`: `go run ./cmd/server`
3. From repo root: `pnpm install && pnpm --filter web dev`

## Test and lint

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check

cd apps/api
gofmt -l .
go test ./...
```

## API

All JSON responses use `{ "data": ... }` or `{ "error": "..." }`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/api/v1/stats` | Counts |
| GET, POST | `/api/v1/initiatives` | List / create initiatives |
| GET, PUT, DELETE | `/api/v1/initiatives/{id}` | Initiative CRUD |
| GET | `/api/v1/initiatives/{id}/projects` | Projects in an initiative |
| GET, POST | `/api/v1/projects` | List / create projects |
| GET, PUT, DELETE | `/api/v1/projects/{id}` | Project CRUD |
| GET | `/api/v1/projects/{id}/issues` | Issues in a project |
| GET, POST | `/api/v1/issues` | List / create issues |
| GET, PUT, DELETE | `/api/v1/issues/{id}` | Issue CRUD |

Issue `status` values: `open`, `in_progress`, `done`.

## License

MIT
