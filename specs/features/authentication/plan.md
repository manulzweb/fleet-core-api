# Authentication Implementation Plan

## Components

- AuthController
- AuthService
- User DAO
- Login DTO
- Register DTO
- Login response DTO
- JwtAuthGuard
- RolesGuard
- ApiKeyGuard
- @Public()
- @Roles()
- @User()

## Implementation Steps

1. Configure JWT and environment variables.
2. Install and configure bcrypt.
3. Create DTOs for registration and login.
4. Implement password hashing and credential validation.
5. Implement the authentication service.
6. Implement registration and login endpoints.
7. Configure JWT generation and validation.
8. Implement the @Public(), @Roles() and @User() decorators.
9. Implement JwtAuthGuard and RolesGuard.
10. Implement ApiKeyGuard for an integration endpoint.
11. Configure global authentication with public-route exclusions.
12. Add unit tests for AuthService and guards.
13. Add end-to-end tests for authentication and authorization.
14. Verify all acceptance criteria.

## Security Constraints

- Never return password hashes.
- Never allow public registration to assign the ADMIN role.
- Never hardcode JWT secrets or API keys.
- Reject missing, invalid and expired tokens.
- Return 401 for unauthenticated requests and 403 for insufficient permissions.