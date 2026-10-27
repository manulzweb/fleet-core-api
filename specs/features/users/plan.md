# Users Implementation Plan

## Components

- UsersController
- UsersService
- User DAO
- User entity
- Create user DTO
- Update user DTO
- User response DTO
- User mapper

## Implementation Steps

1. Define the user entity and its relationship with roles.
2. Create the database migration.
3. (Superseded) services inject the concrete user DAO.
4. Implement the User DAO using TypeORM.
5. Create DTOs for user creation, updates and responses.
6. Implement the user mapper.
7. Implement user registration support required by AuthService.
8. Implement retrieval of the authenticated user's profile.
9. Restrict administrative user operations to ADMIN.
10. Prevent password hashes from appearing in responses.
11. Add unit tests for UsersService and User mapper.
12. Add end-to-end tests for user endpoints.
13. Verify all acceptance criteria.

## Constraints

- Email addresses must be unique.
- Passwords must be hashed by the authentication workflow.
- Public registration must not allow unrestricted ADMIN assignment.
- User responses must never expose password hashes.
- User records referenced by historical operations must not be deleted without a defined retention policy.