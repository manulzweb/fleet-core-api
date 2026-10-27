# FleetCore Seeders Specification

## 1. Execution

The database must be populated using one command:

`npm run seed`

## 2. Required Initial Data

The seeder must create at least:

- 1 ADMIN user.
- 2 TECHNICIAN users.
- 3 mechanics: 2 active and 1 inactive.
- 2 workshops: 1 active and 1 inactive.
- 4 vehicles: 2 AVAILABLE, 1 IN_MAINTENANCE and 1 INACTIVE.
- 1 IN_PROGRESS maintenance associated with the IN_MAINTENANCE vehicle.
- At least 1 COMPLETED maintenance record for history.

The two active mechanics must be associated with the two technician users according to the selected data model. If mechanics and users are separate entities, define their relationship explicitly.

## 3. Idempotency

Running the seeder multiple times must not duplicate records.

Use stable identifiers or unique business keys and update-or-insert behavior where appropriate.

## 4. Data Integrity

- All foreign keys must reference existing records.
- The IN_PROGRESS maintenance must reference the vehicle marked IN_MAINTENANCE.
- The COMPLETED maintenance must contain its required completion data.
- Inactive mechanics and workshops must not be assigned to new maintenance.
- Seed data must respect all database constraints.

## 5. Environment Variables

The project must provide `.env.example` with the following variables:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleetcore

JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=1h

API_KEYS=demo-key-partner-1,demo-key-partner-2
```

These values are examples only. Production secrets must be supplied securely through the deployment environment.