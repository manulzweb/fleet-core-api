# FleetCore API Specification

## 1. General

- Base path: `/api/v1`
- Content type: `application/json`
- Authentication: Bearer JWT
- Identifiers: UUIDv7
- Documentation: Swagger
- Pagination: `page` and `limit` query parameters where applicable.

### Standard HTTP Status Codes

- `200 OK`: Successful request.
- `201 Created`: Resource created.
- `204 No Content`: Successful operation without a response body.
- `400 Bad Request`: Invalid input or invalid state transition data.
- `401 Unauthorized`: Missing or invalid authentication.
- `403 Forbidden`: Insufficient permissions.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Duplicate data or scheduling conflict.
- `500 Internal Server Error`: Unexpected server error.

## 2. Authentication

Base path: `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a TECHNICIAN account |
| POST | `/auth/login` | Public | Authenticate and obtain JWT |

### Register

Request:

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePassword123"
}
```

Response `201 Created`:

```json
{
  "id": "019a0000-0000-7000-8000-000000000001",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "TECHNICIAN"
}
```

The role must be assigned by the server for public registration.

### Login

Request:

```json
{
  "email": "juan@example.com",
  "password": "SecurePassword123"
}
```

Response `200 OK`:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer"
}
```

## 3. Users

Base path: `/api/v1/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/me` | Authenticated | Retrieve current user's profile |
| GET | `/users` | ADMIN | List users |
| GET | `/users/:id` | ADMIN | Retrieve user by ID |
| PATCH | `/users/:id` | ADMIN | Update user information |
| PATCH | `/users/:id/status` | ADMIN | Activate or deactivate user |

### Update User Status

Request:

```json
{
  "isActive": false
}
```

Response `200 OK`:

```json
{
  "id": "019a0000-0000-7000-8000-000000000001",
  "isActive": false
}
```

User responses must never expose password hashes.

## 4. Vehicles

Base path: `/api/v1/vehicles`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/vehicles` | ADMIN | Register vehicle |
| GET | `/vehicles` | Authenticated | List vehicles |
| GET | `/vehicles/:id` | Authenticated | Retrieve vehicle by ID |
| GET | `/vehicles/plate/:plate` | Authenticated | Retrieve vehicle by plate |
| PATCH | `/vehicles/:id` | ADMIN | Update vehicle |
| PATCH | `/vehicles/:id/status` | ADMIN | Change vehicle status |

### Create Vehicle

Request:

```json
{
  "plate": "ABC123",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "currentMileage": 15000
}
```

Response `201 Created`:

```json
{
  "id": "019a0000-0000-7000-8000-000000000002",
  "plate": "ABC123",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "currentMileage": 15000,
  "status": "AVAILABLE"
}
```

Allowed vehicle statuses:

- `AVAILABLE`
- `IN_MAINTENANCE`
- `INACTIVE`

Vehicle status changes must respect maintenance state. Clients must not manually set `IN_MAINTENANCE` or `AVAILABLE` when those changes are controlled by maintenance operations.

## 5. Mechanics

Base path: `/api/v1/mechanics`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/mechanics` | ADMIN | Register mechanic |
| GET | `/mechanics` | Authenticated | List mechanics |
| GET | `/mechanics/:id` | Authenticated | Retrieve mechanic |
| PATCH | `/mechanics/:id` | ADMIN | Update mechanic |
| PATCH | `/mechanics/:id/status` | ADMIN | Activate or deactivate mechanic |

### Create Mechanic

Request:

```json
{
  "name": "Carlos Gómez",
  "email": "carlos@example.com",
  "specialty": "Engine maintenance"
}
```

Response `201 Created`:

```json
{
  "id": "019a0000-0000-7000-8000-000000000003",
  "name": "Carlos Gómez",
  "email": "carlos@example.com",
  "specialty": "Engine maintenance",
  "isActive": true
}
```

Inactive mechanics cannot receive new maintenance assignments.

## 6. Workshops

Base path: `/api/v1/workshops`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/workshops` | ADMIN | Register workshop |
| GET | `/workshops`

## Response Format

All successful responses must use the following envelope, applied by a global interceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

All errors must use a consistent format, applied by a custom exception filter:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "The vehicle ABC123 already has active maintenance",
  "path": "/api/v1/maintenances",
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

### Rules

- The interceptor must wrap successful responses.
- The exception filter must normalize HTTP errors.
- Error responses must include the HTTP status code, message, request path and timestamp.
- Timestamps must use ISO 8601 format.
- Responses must not expose stack traces, secrets or internal database details.
- Paginated results must be returned inside the `data` property.


## External Vehicle Maintenance History

**Endpoint:** `GET /api/v1/integrations/vehicles/:plate/maintenance-history`

**Authentication:** `x-api-key` header.

**Purpose:** Allow authorized external systems to retrieve vehicle information and its completed maintenance history.

### Successful Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "vehicle": {
      "id": "019a0000-0000-7000-8000-000000000002",
      "plate": "ABC123",
      "brand": "Chevrolet",
      "model": "NPR",
      "available": true
    },
    "maintenances": [
      {
        "id": "019a0000-0000-7000-8000-000000000005",
        "type": "PREVENTIVE",
        "status": "COMPLETED",
        "description": "Oil and filter replacement",
        "mileage": 45000,
        "cost": 350000,
        "finishedAt": "2026-09-15T16:30:00.000Z",
        "mechanic": {
          "id": "019a0000-0000-7000-8000-000000000003",
          "name": "Carlos Pérez"
        },
        "workshop": {
          "id": "019a0000-0000-7000-8000-000000000004",
          "name": "Taller Norte"
        }
      }
    ]
  },
  "timestamp": "2026-10-20T19:00:00.000Z"
}
```

### Rules

- The endpoint must require a valid `x-api-key` header.
- The API key must be validated by `ApiKeyGuard`.
- Only completed maintenance records must be included in the history.
- A vehicle that does not exist must return 404.
- A missing or invalid API key must return 401.
- The response must include the vehicle and its completed maintenance records.
- The vehicle availability field must be derived from the current vehicle status.
- The response must follow the standard success envelope.