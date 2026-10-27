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
| GET | `/workshops` | Authenticated | List workshops |
| GET | `/workshops/:id` | Authenticated | Retrieve workshop |
| PATCH | `/workshops/:id` | ADMIN | Update workshop |
| PATCH | `/workshops/:id/status` | ADMIN | Activate or deactivate workshop |

All `:id` path parameters must be UUIDs (otherwise `400`).

### Create Workshop

Request (`name`: 1-120 chars, `address`: 1-255 chars):

```json
{
  "name": "Taller Norte",
  "address": "Calle 100 # 15-20"
}
```

Response `201 Created` (`data`):

```json
{
  "id": "019a0000-0000-7000-8000-000000000004",
  "name": "Taller Norte",
  "address": "Calle 100 # 15-20",
  "isActive": true
}
```

### List Workshops

`GET /workshops?page=1&limit=20&includeInactive=true`

- `page` (default `1`, min 1) and `limit` (default `20`, min 1, max 100).
- `includeInactive` is honored only for `ADMIN`; every other role always receives active workshops only.

Response `200 OK` (`data`):

```json
{
  "items": [
    {
      "id": "019a0000-0000-7000-8000-000000000004",
      "name": "Taller Norte",
      "address": "Calle 100 # 15-20",
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### Update Workshop

`PATCH /workshops/:id` accepts any subset of `name` and `address`. Returns `200` with the workshop (same shape as above).

### Update Workshop Status

Request:

```json
{
  "isActive": false
}
```

Response `200 OK`: the full workshop object with the new `isActive` value.

Inactive workshops cannot receive new maintenance assignments. A workshop that does not exist returns `404`.

## 7. Maintenances

Base path: `/api/v1`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/maintenances` | ADMIN | Schedule a maintenance |
| GET | `/maintenances` | Authenticated | List maintenances |
| GET | `/maintenances/:id` | Authenticated | Retrieve a maintenance |
| PATCH | `/maintenances/:id/status` | Authenticated | Change maintenance status |
| GET | `/vehicles/:vehicleId/maintenances` | Authenticated | Maintenance history of a vehicle |

Access scope:

- `ADMIN` can read and change every maintenance.
- `TECHNICIAN` only sees maintenances assigned to the mechanic linked to their user. A technician without a linked mechanic gets an empty list; reading or changing another mechanic's maintenance returns `403`.

Maintenance types: `PREVENTIVE`, `CORRECTIVE`. Maintenance statuses: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

### Create Maintenance

Request (all fields required; `initialMileage` is an integer >= 0; dates are ISO 8601; the three ids are UUIDs):

```json
{
  "type": "PREVENTIVE",
  "description": "Oil and filter replacement",
  "initialMileage": 45000,
  "scheduledStartAt": "2026-11-02T08:00:00.000Z",
  "scheduledEndAt": "2026-11-02T12:00:00.000Z",
  "vehicleId": "019a0000-0000-7000-8000-000000000040",
  "mechanicId": "019a0000-0000-7000-8000-000000000020",
  "workshopId": "019a0000-0000-7000-8000-000000000030"
}
```

Response `201 Created` (`data`). The maintenance is created as `SCHEDULED`; closure fields are `null`:

```json
{
  "id": "019a0000-0000-7000-8000-000000000060",
  "type": "PREVENTIVE",
  "description": "Oil and filter replacement",
  "initialMileage": 45000,
  "scheduledStartAt": "2026-11-02T08:00:00.000Z",
  "scheduledEndAt": "2026-11-02T12:00:00.000Z",
  "status": "SCHEDULED",
  "vehicleId": "019a0000-0000-7000-8000-000000000040",
  "mechanicId": "019a0000-0000-7000-8000-000000000020",
  "workshopId": "019a0000-0000-7000-8000-000000000030",
  "workPerformed": null,
  "finalCost": null,
  "completedAt": null,
  "finalMileage": null
}
```

Errors:

- `400`: `scheduledEndAt` is not later than `scheduledStartAt`; `initialMileage` is lower than the vehicle's current mileage; invalid body.
- `404`: vehicle, mechanic or workshop not found.
- `409`: vehicle is `INACTIVE`; mechanic or workshop is inactive; the vehicle already has a `SCHEDULED`/`IN_PROGRESS` maintenance; the mechanic has an overlapping `SCHEDULED`/`IN_PROGRESS` maintenance (adjacent windows do not overlap). Concurrent requests that violate the database constraints are also reported as `409`.

### List Maintenances

`GET /maintenances?page=1&limit=20&vehicleId=<uuid>&mechanicId=<uuid>&status=SCHEDULED`

All filters are optional. For `TECHNICIAN`, `mechanicId` is overridden with their own mechanic. Results are ordered by `scheduledStartAt` descending. Response `200 OK` (`data`) uses the paginated shape `{ items, total, page, limit }`, where each item has the maintenance shape shown above.

### Get Maintenance

`GET /maintenances/:id` returns `200` with the maintenance shape, `404` if it does not exist, `403` if a technician does not own it.

### Maintenance History of a Vehicle

`GET /vehicles/:vehicleId/maintenances` accepts the same query parameters as the list endpoint (the path `vehicleId` takes precedence) and returns the same paginated shape. Returns `404` if the vehicle does not exist.

### Change Maintenance Status

`PATCH /maintenances/:id/status`

Allowed transitions:

| From | To |
|---|---|
| `SCHEDULED` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `COMPLETED`, `CANCELLED` |
| `COMPLETED` | none |
| `CANCELLED` | none |

Any other transition returns `409` (`Invalid status transition <from> -> <to>`).

Request to start or cancel:

```json
{
  "status": "IN_PROGRESS"
}
```

Request to complete (`workPerformed`, `finalCost`, `completedAt` and `finalMileage` are required for `COMPLETED`, otherwise `400`; `finalCost` >= 0 with at most 2 decimals; `finalMileage` must not be lower than `initialMileage`, otherwise `400`):

```json
{
  "status": "COMPLETED",
  "workPerformed": "Oil and filter replaced",
  "finalCost": 350000,
  "completedAt": "2026-11-02T11:30:00.000Z",
  "finalMileage": 45010
}
```

Response `200 OK` (`data`): the updated maintenance (same shape as in Create Maintenance, with the closure fields filled when completed).

Side effects on the vehicle (applied in the same transaction):

- `IN_PROGRESS`: the vehicle must be `AVAILABLE` (otherwise `409`) and becomes `IN_MAINTENANCE`.
- `COMPLETED`: the vehicle's `currentMileage` becomes the greater of its current value and `finalMileage`; an `IN_MAINTENANCE` vehicle returns to `AVAILABLE`.
- `CANCELLED` from `IN_PROGRESS`: an `IN_MAINTENANCE` vehicle returns to `AVAILABLE`.

Errors: `400` (missing/invalid completion data), `403` (technician does not own the maintenance), `404`, `409` (invalid transition, vehicle not available, or database constraint violation).

See [`specs/decisions/spec-discrepancies.md`](decisions/spec-discrepancies.md) for the places where the implementation intentionally differs from the original specification.

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