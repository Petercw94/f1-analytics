# F1 Data Lab Mockup

Interactive mock that now uses route-based frontend pages plus Prisma-backed fake data.

## Implemented in this iteration

- Route structure aligned to Remix/React Router information architecture:
  - `/`
  - `/sessions/:sessionId`
  - `/compare`
  - `/live`
- Express API routes preserved under `/api/mock/*`
- Prisma + Postgres schema and seed data for all mock payloads

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start Postgres in Docker (creates test credentials and DB automatically):

```bash
docker build -t f1-postgres-test -f docker/postgres/Dockerfile docker/postgres
docker run --name f1-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d f1-postgres-test
```

This container initializes:

- role: `f1_test`
- password: `f1_test_pw`
- database: `f1_mock`

4. Create schema and seed fake data:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

5. Start API + frontend dev servers:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the Express server on `http://localhost:3000`.

## Notes

- This is intentionally fake-data-first to validate UX and architecture quickly.
- The live page is a simulated ticker driven by seeded snapshot data.
- OpenF1 ingestion is intentionally not implemented yet (by request).
