# Workshops Implementation Plan

## Components

- WorkshopsController
- WorkshopsService
- Workshop DAO
- Workshop entity
- Create workshop DTO
- Update workshop DTO
- Workshop response DTO
- Workshop mapper

## Implementation Steps

1. Define the workshop entity and database constraints.
2. Create the database migration.
3. (Superseded) services inject the concrete workshop DAO.
4. Implement the Workshop DAO using TypeORM.
5. Create request and response DTOs.
6. Implement the workshop mapper.
7. Implement workshop registration and updates.
8. Implement listing of active workshops.
9. Implement retrieval by identifier.
10. Implement activation and deactivation.
11. Prevent assignment of inactive workshops.
12. Preserve historical maintenance references.
13. Add unit and end-to-end tests.
14. Verify all acceptance criteria.

## Constraints

- Workshop names and addresses are required.
- Inactive workshops cannot receive new assignments.
- Deactivation must not delete historical maintenance records.
- Only ADMIN can create, update, activate or deactivate workshops.