# FleetCore Security Specification

## 1. Authentication

The application must authenticate users using email and password.

Passwords must be hashed with bcrypt before persistence. Plaintext passwords must never be stored or returned.

Successful authentication must generate a JWT containing the user identifier and role information required for authorization.

JWT expiration and signing configuration must be controlled through environment variables.

## 2. Authorization

The application must support:

- ADMIN
- TECHNICIAN

The application must implement:

- @Public()
- @Roles()
- @User()
- JwtAuthGuard
- RolesGuard

Public routes must be explicitly declared.

Private routes must reject requests without a valid JWT.

Authenticated users without the required role must receive HTTP 403.

## 3. Registration

Public registration must not permit unrestricted ADMIN assignment.

The initial administrator must be created through a controlled bootstrap or seeding process.

## 4. Technician Permissions

Technicians may consult maintenance records assigned to them.

Technicians may update the status of their own assignments only when the requested transition is permitted.

Technicians must not access or modify another technician's assignments without explicit authorization.

## 5. API Key

At least one external integration endpoint must require an API key.

The key must be read from an environment variable.

A dedicated ApiKeyGuard must validate the provided key.

Missing or invalid keys must be rejected.

The key must never be returned in API responses or written to application logs.

## API Key Configuration

- Integration requests must provide the key through the `x-api-key` header.
- The application must support multiple configured API keys through the `API_KEYS` environment variable.
- Keys must be compared against the configured values.
- Missing or invalid keys must be rejected with HTTP 401.
- API keys must not be included in logs or responses.
- Example keys in `.env.example` must be fictitious and used only for development.

## 6. Input Validation

All request DTOs must validate incoming data.

Clients must not be allowed to set protected fields such as password hashes, administrative roles, or system-managed status fields through unrestricted request bodies.

## 7. Error Handling

Authentication errors must not disclose whether a specific password or account exists beyond the necessary API behavior.

Internal database errors and secrets must not be exposed in production responses.

## 8. Environment Variables

Sensitive configuration must not be committed to version control.

The application must validate required environment variables at startup.

