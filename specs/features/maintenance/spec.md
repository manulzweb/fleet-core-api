# Maintenance Specification

## Requirements

- ADMIN can create and manage maintenance records.
- Each maintenance references an existing vehicle, mechanic and workshop.
- Maintenance types are PREVENTIVE and CORRECTIVE.
- Initial status is SCHEDULED.
- Supported statuses are SCHEDULED, IN_PROGRESS, COMPLETED and CANCELLED.
- A vehicle cannot have multiple active maintenance records.
- A mechanic cannot have overlapping active maintenance schedules.
- Initial mileage cannot be lower than the vehicle's recorded mileage.
- Starting maintenance changes vehicle status to IN_MAINTENANCE.
- Completing maintenance restores vehicle status to AVAILABLE.
- Completion requires work performed, final cost, completion date and final mileage.
- Completed maintenance cannot return to a previous state.
- Cancelled maintenance cannot transition to IN_PROGRESS or COMPLETED.
- Users can query maintenance history by vehicle.
- Technicians can view and update only their assigned maintenance according to permitted transitions.

## State Transitions

- SCHEDULED -> IN_PROGRESS
- SCHEDULED -> CANCELLED
- IN_PROGRESS -> COMPLETED
- IN_PROGRESS -> CANCELLED, subject to the documented cancellation policy

All other transitions are rejected.

## Acceptance Criteria

- Missing or inactive related resources are rejected.
- Conflicting vehicle assignments return 409.
- Overlapping mechanic schedules return 409.
- Invalid state transitions return 409.
- Completion without required closure data returns 400.
- Maintenance and vehicle status changes are transactional.
- Maintenance history remains accessible after completion or cancellation.