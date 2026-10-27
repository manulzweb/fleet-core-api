# FleetCore API

![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-1.x-FE0803?logo=typeorm&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-auth-000000?logo=jsonwebtokens&logoColor=white) ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=githubactions&logoColor=white) ![License](https://img.shields.io/badge/License-MIT-yellow)

REST API for managing a transport company's vehicles, mechanics, workshops and maintenance operations.

## Project data

| Item | Value |
|---|---|
| Name | fleet-core-api |
| Version | 0.0.1 |
| Author | manulzweb |
| License | MIT |
| Methodology | Spec-Driven Development (see below) |
| Architecture | Layered, organised in NestJS modules |
| API base path | `/api/v1` |
| API documentation | Swagger UI at `/api/docs` (non-production) |
| Database | PostgreSQL 16, schema versioned with TypeORM migrations |
| Modules | auth, users, vehicles, mechanics, workshops, maintenances, integrations |
| Roles | `ADMIN`, `TECHNICIAN` |
| Runtime | Node.js 22 |

## Tech stack

| Area | Technology | Version | Use |
|---|---|---|---|
| Framework | NestJS | 12 | Modules, dependency injection, guards, interceptors, filters |
| Language | TypeScript | 6 | Strict typing, decorators |
| Database | PostgreSQL | 16 | Relational storage, exclusion constraints (`btree_gist`), partial unique indexes |
| ORM | TypeORM | 1.x | Entities, repositories, migrations, transactions, pessimistic locks |
| Identifiers | uuid | 14 | UUIDv7 primary keys |
| Authentication | `@nestjs/jwt`, bcrypt | 12 / 6 | JWT access tokens, password hashing |
| Validation | class-validator, class-transformer | 0.15 / 0.5 | DTO validation and transformation |
| Security | helmet, `@nestjs/throttler` | 8 / 6 | HTTP headers, rate limiting |
| Documentation | `@nestjs/swagger` | 12 | OpenAPI specification and UI |
| Testing | Vitest, Supertest | 4 / 7 | Unit, integration and end-to-end tests |
| Code quality | oxlint, Prettier | 1.x / 3 | Linting and formatting |
| Git hooks | Husky, lint-staged, commitlint | 9 / 17 / 21 | Pre-commit checks, Conventional Commits |
| Containers | Docker, Docker Compose | n/a | API and PostgreSQL deployment |
| CI | GitHub Actions | n/a | Lint, format, build and test pipeline |

## Contents

1. [Project data and tech stack](#project-data)
2. [Development approach: Spec-Driven Development](#development-approach-spec-driven-development)
3. [Architecture](#architecture)
4. [Running the project](#running-the-project)
5. [Testing](#testing)
6. [API surface](#api-surface)
7. [Repository workflow](#repository-workflow)

## Development approach: Spec-Driven Development

### What SDD is

Spec-Driven Development (SDD) inverts the usual order of work. The specification is written first, in versioned Markdown, and is treated as the single source of truth. Code, tests and documentation are derived from it, and a feature is considered complete only when its implementation satisfies its acceptance criteria. When code and specification disagree, the disagreement is resolved explicitly and recorded, instead of being settled silently in the code.

Three properties make the approach useful:

- **Unambiguous input.** Requirements carry stable identifiers (for example `MNT-007`, `AUTH-010`), so each one can be traced to a task, an implementation and a test.
- **Decisions before code.** Contradictions and gaps are found while reading the specification, before they become defects.
- **Verifiable completion.** Acceptance criteria are written as testable statements, so "done" is a measurable condition.

### Specification layout

All specifications live in `specs/`.

| File | Purpose |
|---|---|
| `constitution.md` | Technology stack, architecture rules, security and data-integrity principles. |
| `architecture.md` | Layer responsibilities and dependency direction. |
| `requirements.md` | 57 numbered functional and non-functional requirements. |
| `database.md` | Tables, constraints, active-maintenance rules, concurrency requirements. |
| `api.md` | Endpoints, status codes, response envelope, integration endpoint. |
| `security.md` | Authentication, authorization, API keys, validation, error handling. |
| `testing.md` | Test levels and the list of required scenarios. |
| `seeders.md` | Reproducible initial data and idempotency rules. |
| `implementation-plan.md` | Eight ordered delivery phases. |
| `features/<name>/` | Per-feature `spec.md` (requirements and acceptance criteria), `plan.md` (components and steps) and `tasks.md` (checklist). Features: authentication, users, vehicles, mechanics, workshop, maintenance. |
| `features/documentation.md` | Code documentation standard (JSDoc and Swagger). |
| `decisions/spec-discrepancies.md` | Contradictions found in the specifications and the decision taken for each. |

Directory tree of `specs/`:

```
specs/
├── api.md
├── architecture.md
├── constitution.md
├── database.md
├── decisions
│   └── spec-discrepancies.md
├── features
│   ├── authentication
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── documentation.md
│   ├── maintenance
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── mechanics
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── users
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── vehicles
│   │   ├── plan.md
│   │   ├── spec.md
│   │   └── tasks.md
│   └── workshop
│       ├── plan.md
│       ├── spec.md
│       └── tasks.md
├── implementation-plan.md
├── requirements.md
├── security.md
├── seeders.md
└── testing.md
```

### How SDD was applied in this project

1. **Specification first.** The constitution, architecture, requirements, database, API, security, testing and seeder documents were written before any application code existed.
2. **Analysis of the specification.** Before implementing, the specifications were read as a whole to find dependencies and contradictions. Nine were found and documented in `specs/decisions/spec-discrepancies.md` before being resolved. Examples: the constitution lists Jest while the project uses Vitest; an invalid state transition returns 400 in `api.md` and 409 in the maintenance specification (409 was chosen, following the feature specification); technicians own maintenance records but no user-to-mechanic relation was defined (a nullable unique `mechanics.user_id` foreign key was added).
3. **Phased implementation.** Work followed `implementation-plan.md`: setup, database, authentication, core resources, maintenance, concurrency, integration, final verification. The implementation was produced by an AI coding assistant working from the specifications. Later, independent work packages (DAO refactor, DTO split, CI, security hardening, coverage) were delegated to parallel AI agents with disjoint file sets, each bounded by the contracts fixed in the specifications.
4. **Tests derived from acceptance criteria.** The scenarios listed in `testing.md` map directly to unit, integration and end-to-end tests. Examples: duplicate vehicle plate returns 409, overlapping mechanic schedules return 409, adjacent intervals are allowed, completion without closure data returns 400, a technician cannot read another technician's assignment, and simultaneous scheduling requests produce exactly one success.
5. **Constraints enforced where they belong.** Rules that must hold under concurrency are implemented in PostgreSQL (an exclusion constraint over `tstzrange` for mechanic overlap, a partial unique index for one active maintenance per vehicle, `CHECK` constraints) and verified by concurrent requests, in addition to service-level validation.
6. **Verification against the specification.** After each phase the relevant checks were run (lint, build, unit, integration, e2e), and the task lists in `specs/features/*/tasks.md` were updated.
7. **Specification kept in sync.** When implementation clarified a gap (for example the workshops and maintenance endpoints missing from `api.md`), the specification was updated, so it remains an accurate description of the system.

### Impact on productivity

This section reports what can be verified from the repository and states what has not been measured.

Verifiable outcomes:

- A complete REST API (about 3,600 lines of application code across 7 modules) was derived from the specifications and implements the 57 numbered requirements.
- 125 unit tests, 15 DAO integration tests and 27 end-to-end tests pass, including concurrency scenarios against a real PostgreSQL instance.
- Nine specification contradictions were detected before implementation, rather than discovered as rework.
- Independent modules could be implemented in parallel because the contracts (DTOs, response envelope, error codes, layer rules) were already fixed in writing.
- Dependencies between features (for example maintenance depending on vehicles, mechanics and workshops) were known in advance, which determined the build order.

Mechanisms behind the gain:

- Less rework: decisions are made once, in the specification, instead of being re-derived while coding.
- Parallelism: fixed interfaces allow several contributors, human or automated, to work without coordination overhead.
- Test generation: acceptance criteria are already phrased as verifiable statements, so tests are written from them rather than designed from scratch.
- Onboarding and review: a reviewer can compare behavior against a requirement identifier instead of inferring intent from code.

Limits of this claim: no baseline project was built without SDD, and development time was not recorded, so no percentage or hours-saved figure is reported. A quantitative comparison would require time tracking on a comparable project. The qualitative effects above are consistent with the repository history, but they are not a measured result.

## Architecture

Layered architecture organised in NestJS modules. Each module contains only the components it needs:

```
src/modules/<module>/
  <module>.controller.ts   HTTP concerns only
  <module>.service.ts      business rules and transactions
  dao/                     TypeORM repositories, persistence queries
  dto/                     one class per file, request and response contracts
  entities/                TypeORM entities
  mapper/                  entity to response DTO conversion
```

Rules enforced by `scripts/check-structure.sh` on every commit: controllers do not import DAOs, entities or TypeORM; services do not depend on HTTP objects; DAOs do not import services or controllers; each `*.dto.ts` file declares a single class.

Cross-cutting code is in `src/common` (decorators `@Public`, `@Roles`, `@User`; `JwtAuthGuard`, `RolesGuard`, `ApiKeyGuard`; exception filter; response interceptor). Database schema is versioned in `src/database/migrations`; production schema synchronization is disabled.

Maintenance operations run inside transactions with pessimistic locks on the vehicle row. Vehicle availability and maintenance status change atomically.

## Running the project

### Docker (API and PostgreSQL)

```bash
cp .env.example .env          # set JWT_SECRET and API_KEYS
docker compose up -d --build  # applies migrations on start
```

`JWT_SECRET` and `API_KEYS` are required by `docker-compose.yml`. With `NODE_ENV=production` the application rejects example secrets, a `JWT_SECRET` shorter than 32 characters and `demo-*` API keys.

API: `http://localhost:3000/api/v1`. Swagger: `http://localhost:3000/api/docs` (disabled when `NODE_ENV=production`).

### Local development

```bash
cp .env.example .env
docker compose up -d postgres   # PostgreSQL on localhost:5440 (DB_PORT)
npm install
npm run migration:run
npm run seed                    # idempotent; users use SEED_PASSWORD (default Passw0rd!123)
npm run start:dev
```

Seed users: `admin@fleetcore.local`, `tech1@fleetcore.local`, `tech2@fleetcore.local`.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing and lifetime. |
| `API_KEYS` | Comma-separated keys accepted by the integration endpoint. |
| `CORS_ORIGINS` | Comma-separated allowed origins. Unset disables CORS in production. |
| `THROTTLE_LIMIT`, `THROTTLE_LOGIN_LIMIT` | Requests per minute, global and for login. |

## Testing

```bash
npm test          # unit tests
npm run test:int  # DAO integration tests (requires PostgreSQL)
npm run test:e2e  # end-to-end tests (requires PostgreSQL)
npm run test:cov  # unit tests with coverage thresholds
```

Integration and e2e suites use one database per Vitest worker, named `${DB_NAME_TEST:-fleetcore_test}_<worker id>`, created on demand. The database user needs `CREATE DATABASE`. Connection settings come from `DB_HOST`, `DB_PORT`, `DB_USERNAME` and `DB_PASSWORD`.

## API surface

Base path `/api/v1`. All routes except `auth/*` and the integration endpoint require a Bearer JWT.

`auth/register`, `auth/login` · `users` · `vehicles` (`/plate/:plate`, `/:id/maintenances`) · `mechanics` · `workshops` · `maintenances` (`PATCH /:id/status`) · `integrations/vehicles/:plate/maintenance-history` (header `x-api-key`).

Full contract: `specs/api.md`. Decisions taken where the specifications were incomplete or contradictory: `specs/decisions/spec-discrepancies.md`.

## Repository workflow

- Branches: `main`, `develop`, `feat/*`, `fix/*`, `docs/*`, `style/*`. Modules are developed in `feat/<module>` branches and merged with `--no-ff`.
- Commits follow Conventional Commits, validated by commitlint.
- Husky pre-commit hook runs the structure check, `tsc --noEmit` and the unit tests related to staged files.
- CI (`.github/workflows/ci.yml`) runs lint, format check, build, unit, integration and e2e tests against PostgreSQL 16.
