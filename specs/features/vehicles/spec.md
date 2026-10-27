# Vehicles Specification

## Requirements

- ADMIN can register, update and deactivate vehicles.
- Authorized users can list and retrieve vehicles by UUID or license plate.
- Each vehicle contains plate, brand, model, year, mileage and status.
- License plates must be unique.
- Supported statuses are AVAILABLE, IN_MAINTENANCE and INACTIVE.
- Inactive vehicles cannot receive new maintenance assignments.
- Vehicle deactivation must preserve maintenance history.
- Vehicle mileage must never become negative or decrease through maintenance updates.

## Acceptance Criteria

- Valid vehicle data creates a record.
- Duplicate plates return 409.
- Missing vehicles return 404.
- Invalid mileage or year returns 400.
- Inactive vehicles cannot receive new maintenance assignments.
- Historical maintenance remains accessible after vehicle deactivation.