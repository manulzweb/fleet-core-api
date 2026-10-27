# FleetCore Database Specification

## 1. Database

- Engine: PostgreSQL.
- ORM: TypeORM.
- Primary keys: UUIDv7.
- Schema changes: TypeORM migrations.
- Initial data: seeders.
- Production schema synchronization must be disabled.

## 2. Tables

### roles

- id: UUID, primary key.
- code: VARCHAR(30), unique, not null.
- name: VARCHAR(50), not null.

### users

- id: UUID, primary key.
- name: VARCHAR(120), not null.
- email: VARCHAR(254), unique, not null.
- password_hash: VARCHAR(255), not null.
- role_id: UUID, foreign key to roles.
- is_active: BOOLEAN, not null.
- created_at: TIMESTAMPTZ, not null.
- updated_at: TIMESTAMPTZ, not null.

### vehicles

- id: UUID, primary key.
- plate: VARCHAR(20), unique, not null.
- brand: VARCHAR(80), not null.
- model: VARCHAR(80), not null.
- year: SMALLINT, not null.
- current_mileage: INTEGER, not null.
- status: VARCHAR(30), not null.
- created_at: TIMESTAMPTZ, not null.
- updated_at: TIMESTAMPTZ, not null.

### mechanics

- id: UUID, primary key.
- name: VARCHAR(120), not null.
- email: VARCHAR(254), unique, not null.
- specialty: VARCHAR(100), not null.
- is_active: BOOLEAN, not null.
- created_at: TIMESTAMPTZ, not null.
- updated_at: TIMESTAMPTZ, not null.

### workshops

- id: UUID, primary key.
- name: VARCHAR(120), not null.
- address: VARCHAR(255), not null.
- is_active: BOOLEAN, not null.
- created_at: TIMESTAMPTZ, not null.
- updated_at: TIMESTAMPTZ, not null.

### maintenances

- id: UUID, primary key.
- type: VARCHAR(30), not null.
- description: TEXT, not null.
- initial_mileage: INTEGER, not null.
- scheduled_start_at: TIMESTAMPTZ, not null.
- scheduled_end_at: TIMESTAMPTZ, not null.
- status: VARCHAR(30), not null.
- vehicle_id: UUID, foreign key to vehicles.
- mechanic_id: UUID, foreign key to mechanics.
- workshop_id: UUID, foreign key to workshops.
- work_performed: TEXT, nullable until completion.
- final_cost: NUMERIC(12,2), nullable until completion.
- completed_at: TIMESTAMPTZ, nullable until completion.
- final_mileage: INTEGER, nullable until completion.
- created_at: TIMESTAMPTZ, not null.
- updated_at: TIMESTAMPTZ, not null.

## 3. Valid Values

Vehicle statuses:
- AVAILABLE
- IN_MAINTENANCE
- INACTIVE

Maintenance types:
- PREVENTIVE
- CORRECTIVE

Maintenance statuses:
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED

## 4. Constraints

- User email addresses must be unique.
- Mechanic email addresses must be unique.
- Vehicle license plates must be unique after normalization.
- Vehicle mileage and maintenance mileage must be non-negative.
- Vehicle year must be within the configured valid range.
- Scheduled end time must be later than scheduled start time.
- Final cost must be non-negative.
- Final mileage must not be lower than initial mileage.
- Foreign keys must preserve relational integrity.
- Historical maintenance records must not be deleted through cascading deletes.

## 5. Active Maintenance

SCHEDULED and IN_PROGRESS are considered active maintenance statuses.

The database must prevent more than one active maintenance per vehicle.

Mechanic scheduling must prevent overlapping active maintenance intervals, including assignments at different workshops.

Adjacent intervals are allowed: a maintenance ending at 09:00 does not conflict with another starting at 09:00.

Implement database-level concurrency protection using appropriate PostgreSQL constraints and transactional operations.

## 6. Mileage Updates

The initial maintenance mileage must not be lower than the vehicle's current recorded mileage when the maintenance is created.

When maintenance is completed, the vehicle's recorded mileage must be updated consistently with the final mileage.

Concurrent updates must not allow the vehicle's recorded mileage to decrease.

## 7. Historical Records

Vehicles, mechanics and workshops must be deactivated instead of physically deleted when historical maintenance references exist.

Completed and cancelled maintenance records must remain available for historical queries.