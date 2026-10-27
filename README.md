# FleetCore API

REST API (NestJS, TypeORM, PostgreSQL) for vehicles, mechanics, workshops and maintenance. Specs live in `specs/`.

## Run with Docker (API + PostgreSQL)

```bash
cp .env.example .env
docker compose up -d --build   # applies migrations on start
```

API: `http://localhost:3000/api/v1` · Swagger: `http://localhost:3000/api/docs`

## Local development

```bash
cp .env.example .env
docker compose up -d postgres  # DB on localhost:5440 (DB_PORT)
npm install
npm run migration:run
npm run seed                   # idempotent; users use SEED_PASSWORD (default Passw0rd!123)
npm run start:dev
```

Seed users: `admin@fleetcore.local`, `tech1@fleetcore.local`, `tech2@fleetcore.local`.

## Tests

```bash
npm test          # unit
npm run test:int  # DAO integration tests, needs PostgreSQL
npm run test:e2e  # needs PostgreSQL
npm run test:cov  # unit + coverage thresholds
```

`test:int` and `test:e2e` use one database per vitest worker, named
`${DB_NAME_TEST:-fleetcore_test}_<worker id>` (e.g. `fleetcore_test_1`), created
automatically, so test files run in parallel. The DB user needs `CREATE DATABASE`
(the CI `postgres` superuser does); connection settings still come from
`DB_HOST`, `DB_PORT`, `DB_USERNAME` and `DB_PASSWORD`.

## Endpoints (`/api/v1`)

`auth/register|login` · `users` · `vehicles` (+`/plate/:plate`, `/:id/maintenances`) · `mechanics` · `workshops` ·
`maintenances` (+`PATCH /:id/status`) · `integrations/vehicles/:plate/maintenance-history` (header `x-api-key`).
Design decisions on spec gaps: `specs/decisions/spec-discrepancies.md`.
