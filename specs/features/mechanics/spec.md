# Mechanics Specification

## Requirements

- ADMIN can register, update, activate and deactivate mechanics.
- Each mechanic contains name, email, specialty and active status.
- Mechanic email addresses must be unique.
- Inactive mechanics cannot receive new maintenance assignments.
- Mechanics can work at different workshops.
- A mechanic cannot have overlapping active maintenance intervals, regardless of workshop.
- Adjacent intervals are allowed.
- Deactivation must preserve maintenance history.

## Acceptance Criteria

- Duplicate email addresses are rejected.
- Inactive mechanics cannot receive new assignments.
- Overlapping maintenance schedules return 409.
- Schedules at different workshops are checked using the same conflict rules.
- A maintenance ending at 09:00 does not conflict with another starting at 09:00.