# Workshops Specification

## Requirements

- ADMIN can register, update, activate and deactivate workshops.
- Each workshop contains name, address and active status.
- Authorized users can list active workshops and retrieve workshop details.
- Inactive workshops cannot receive new maintenance assignments.
- Workshop deactivation must preserve historical references.

## Acceptance Criteria

- Valid workshop data creates a record.
- Missing workshops return 404.
- Inactive workshops cannot receive new assignments.
- Deactivation does not delete historical maintenance records.