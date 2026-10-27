# FleetCore Testing Strategy

## Unit Tests

Test services, mappers, validation rules and state transitions independently.

## Integration Tests

Test DAOs and persistence behavior against PostgreSQL.

## End-to-End Tests

Test complete HTTP workflows, including authentication, authorization, resource management and maintenance operations.

## Required Scenarios

- Invalid credentials.
- Missing or expired JWT.
- Insufficient role permissions.
- Invalid API key.
- Duplicate vehicle plate.
- Inactive vehicle, mechanic or workshop.
- Missing related resources.
- Invalid mileage.
- Duplicate active maintenance for a vehicle.
- Overlapping mechanic schedules.
- Invalid state transitions.
- Missing maintenance completion data.
- Incorrect vehicle availability after status changes.
- Unauthorized technician access.
- Concurrent scheduling requests.

## Completion Criteria

A feature is complete when its acceptance criteria are verified by appropriate tests and the implementation is consistent with its specification.