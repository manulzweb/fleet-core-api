# FleetCore Constitution

## 1. Purpose

FleetCore is a REST API designed to manage a transport company's vehicles, mechanics, workshops and maintenance operations.

## 2. Technology Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- bcrypt
- class-validator
- class-transformer
- Jest
- Supertest
- Swagger
- UUIDv7

## 3. Architecture

The application must use a layered architecture organized into NestJS modules.

Each business module must contain the components it requires:

- Controller
- Service
- DAO
- DTO
- Entity
- Mapper

Not every module must contain every component if it is unnecessary.

## 4. Component Responsibilities

- Controllers handle HTTP requests and responses.
- Services implement business rules and coordinate operations.
- DAOs handle database access through TypeORM repositories.
- DTOs define and validate request and response data.
- Entities represent database records.
- Mappers convert entities into response DTOs and map incoming data when appropriate.

## 5. Security

- Passwords must be hashed using bcrypt.
- Private endpoints must require valid JWT authentication.
- The application must support ADMIN and TECHNICIAN roles.
- Authorization must use custom decorators and guards.
- At least one integration endpoint must require an API key.
- Secrets must be provided through environment variables.
- Public registration must not allow unrestricted ADMIN role assignment.

## 6. Data Integrity

- Vehicle license plates must be unique.
- Foreign keys must protect relational integrity.
- Historical maintenance records must be preserved.
- Maintenance status changes and vehicle availability updates must be transactional.
- Concurrent operations must not violate scheduling constraints.
- Database changes must be versioned through migrations.

## 7. Development Standards

- Controllers must not contain business rules.
- DTOs must not be used as TypeORM entities.
- DAOs must encapsulate database access.
- Services must not depend on HTTP request or response objects.
- Mappers must centralize entity-to-DTO transformations.
- Business rules must be covered by automated tests.
- Seeders must provide reproducible initial data.

## 8. Verification

Each feature must have documented requirements, acceptance criteria, implementation tasks and automated tests.

A feature is complete only when its implementation satisfies its specification.