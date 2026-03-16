# Test Guide

This project uses Vitest and splits tests into three categories so you can get fast feedback while building schema changes.

## Unit tests

Unit tests are fast and do not require a running database.

Run:

```bash
npm run test:unit
```

Includes:

- Existing client tests under `src/**/*.test.ts`
- Prisma schema contract tests under `tests/**/*.unit.test.ts`

The Prisma contract test checks for required model/constraint declarations directly in `prisma/schema.prisma`.

## Smoke tests

Smoke tests verify Prisma CLI commands work for the current schema/config.

Run:

```bash
npm run test:smoke
```

Checks:

- `prisma validate` succeeds
- `prisma generate` succeeds

## Integration tests

Integration tests verify constraints are actually created in PostgreSQL after `prisma db push`.

Prerequisites:

- A running Postgres instance
- `DATABASE_URL` set in environment (or via `.env`)

Run:

```bash
npm run test:integration
```

What this does:

- Runs `prisma db push --skip-generate`
- Connects to Postgres
- Asserts unique indexes exist for ingestion idempotency constraints

## Run everything

You can still run all test files with:

```bash
npm test
```

Note: integration tests are gated behind `RUN_INTEGRATION_TESTS=1` and are skipped unless you use `npm run test:integration`.
