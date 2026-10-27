# Mechanics Implementation Plan

## Components

- MechanicsController
- MechanicsService
- Mechanic DAO
- Mechanic entity
- Create mechanic DTO
- Update mechanic DTO
- Query mechanic DTO
- Mechanic response DTO
- Mechanic mapper

## Implementation Steps

1. Define the mechanic entity and its database constraints.
2. Create the database migration.
3. (Superseded) services inject the concrete mechanic DAO.
4. Implement the Mechanic DAO using TypeORM.
5. Create request and response DTOs.
6. Implement the mechanic mapper.
7. Implement mechanic registration and updates.
8. Implement listing and retrieval by identifier.
9. Implement activation and deactivation.
10. Add filtering and pagination if required.
11. Prevent assignment of inactive mechanics.
12. Implement schedule-conflict queries for active maintenance intervals.
13. Ensure schedule validation considers assignments across all workshops.
14. Add unit and end-to-end tests.
15. Verify all acceptance criteria.

## Constraints

- Mechanic email addresses must be unique.
- Inactive mechanics cannot receive new assignments.
- Existing maintenance history must be preserved.
- Adjacent schedule intervals are permitted.
- Concurrent assignments must not bypass schedule-conflict validation.