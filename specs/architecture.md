# FleetCore Architecture

## 1. Architecture Style

The application uses layered architecture with NestJS modules.

Each module encapsulates a business domain and contains its controller, service, DAO, DTOs, entities and mapper as required.

## 2. Module Structure

Example:

vehicles/
- vehicles.controller.ts
- vehicles.module.ts
- vehicles.service.ts
- dao/vehicle.dao.ts
- dto/
- entities/vehicle.entity.ts
- mapper/vehicle.mapper.ts

## 3. Responsibilities

### Controller

- Defines REST endpoints.
- Receives HTTP parameters and request bodies.
- Uses DTOs for input validation.
- Invokes services.
- Returns HTTP responses.
- Applies authentication and authorization metadata.

### Service

- Implements business rules.
- Coordinates operations between DAOs.
- Validates relationships and resource availability.
- Coordinates database transactions when multiple records must change.
- Raises appropriate application exceptions.

### DAO

- Encapsulates database access.
- Uses TypeORM repositories.
- Implements queries and persistence operations.
- Avoids implementing business rules that belong to services.

### DTO

- Defines request and response contracts.
- Validates incoming data using class-validator.
- Prevents clients from directly controlling protected fields.

### Entity

- Defines TypeORM columns, relationships and database constraints.
- Represents persisted data.

### Mapper

- Converts entities into response DTOs.
- Centralizes transformations between persistence objects and external representations.
- Prevents persistence-specific fields from leaking into API responses.

## 4. Dependency Direction

- Controllers depend on services.
- Services depend on concrete DAOs and other required services.
- DAOs depend on TypeORM.
- Mappers transform data between entities and DTOs.
- DTOs must not depend on TypeORM entities.
- Entities must not depend on controllers or DTOs.

## 5. Cross-cutting Components

The common directory contains reusable decorators, guards, filters and other shared components.

Authentication and authorization must be implemented using NestJS guards.

## 6. Database Transactions

Operations that update a maintenance record and vehicle availability must be atomic.

Scheduling and assignment operations must prevent concurrent requests from violating vehicle and mechanic availability rules.

## 7. Error Handling

The API must use appropriate NestJS HTTP exceptions.

Database uniqueness or scheduling conflicts must be translated into descriptive HTTP 409 responses where appropriate.

Unexpected errors must not expose sensitive database details.