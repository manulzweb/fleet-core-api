# Authentication Specification

## Requirements

- Users can register and log in using email and password.
- Passwords must be hashed with bcrypt.
- Successful login returns a JWT.
- Private routes require a valid, non-expired JWT.
- The system supports ADMIN and TECHNICIAN roles.
- At least three custom decorators must be implemented: @Public(), @Roles() and @CurrentUser().
- A dedicated RolesGuard must enforce role permissions.
- An integration endpoint must require an API key validated by ApiKeyGuard.
- Public registration must not allow users to assign themselves ADMIN privileges.

## Acceptance Criteria

- Valid credentials return a JWT.
- Invalid credentials return 401.
- Missing, invalid or expired JWTs return 401 on private routes.
- Authenticated users without the required role receive 403.
- Invalid API keys are rejected.
- Password hashes are never returned by the API.