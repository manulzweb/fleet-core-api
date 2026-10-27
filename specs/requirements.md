# FleetCore Requirements

## 1. Authentication and Authorization

- AUTH-001: The system must allow users to register.
- AUTH-002: Users must authenticate using email and password.
- AUTH-003: Passwords must be hashed using bcrypt.
- AUTH-004: Successful authentication must return a JWT.
- AUTH-005: Private endpoints must reject missing, invalid or expired JWTs.
- AUTH-006: The system must support ADMIN and TECHNICIAN roles.
- AUTH-007: The system must implement @Roles(), @User() and @Public().
- AUTH-008: A RolesGuard must enforce role-based authorization.
- AUTH-009: At least one integration endpoint must require an API key.
- AUTH-010: The API key must be stored in an environment variable and validated by a dedicated guard.

## 2. Users

- USER-001: The system must store user names, email addresses, password hashes and roles.
- USER-002: Email addresses must be unique.
- USER-003: Users must be able to retrieve their own profile.
- USER-004: Public registration must not grant unrestricted ADMIN privileges.

## 3. Vehicles

- VEH-001: ADMIN must be able to register vehicles.
- VEH-002: Authenticated users must be able to list vehicles according to their permissions.
- VEH-003: The system must prevent duplicate license plates.
- VEH-004: Users must be able to retrieve vehicles by identifier or license plate.
- VEH-005: ADMIN must be able to update and deactivate vehicles.
- VEH-006: Vehicles must support AVAILABLE, IN_MAINTENANCE and INACTIVE statuses.
- VEH-007: INACTIVE vehicles cannot receive new maintenance assignments.
- VEH-008: Vehicle deactivation must preserve maintenance history.

## 4. Mechanics

- MEC-001: ADMIN must be able to register and update mechanics.
- MEC-002: Authorized users must be able to get one or more (lists) mechanics.
- MEC-003: ADMIN must be able to activate and deactivate mechanics.
- MEC-004: Inactive mechanics cannot receive new maintenance assignments.
- MEC-005: Mechanics can work at different workshops.
- MEC-006: Mechanics cannot have overlapping active maintenance schedules.

## 5. Workshops

- WOR-001: ADMIN must be able to register and update workshops.
- WOR-002: Authorized users must be able to list active workshops and retrieve (get one) workshop details.
- WOR-003: ADMIN must be able to activate and deactivate workshops.
- WOR-004: Inactive workshops cannot receive new maintenance assignments.
- WOR-005: Workshop deactivation must preserve maintenance history.

## 6. Maintenance

- MNT-001: ADMIN must be able to create maintenance records.
- MNT-002: Each maintenance must reference one vehicle, one mechanic and one workshop.
- MNT-003: Maintenance types must be PREVENTIVE or CORRECTIVE.
- MNT-004: New maintenance records must start in SCHEDULED status.
- MNT-005: Supported statuses must be SCHEDULED, IN_PROGRESS, COMPLETED and CANCELLED.
- MNT-006: The system must validate status transitions.
- MNT-007: A vehicle cannot have more than one active maintenance.
- MNT-008: A mechanic cannot have overlapping active maintenance schedules.
- MNT-009: Initial mileage cannot be lower than the vehicle's current mileage.
- MNT-010: Starting maintenance must update vehicle availability.
- MNT-011: Completing maintenance must restore vehicle availability when appropriate.
- MNT-012: Completion must require work performed, final cost, completion date and final mileage.
- MNT-013: Users must be able to consult maintenance history by vehicle.
- MNT-014: TECHNICIAN must be able to view assigned maintenance records.
- MNT-015: TECHNICIAN must only update assigned maintenance and must follow the permitted status transitions.
- MNT-016: Historical maintenance records must be preserved.

## 7. Non-functional Requirements

- NFR-001: Application settings must be configurable through environment variables.
- NFR-002: Database changes must use TypeORM migrations.
- NFR-003: Seeders must provide reproducible initial data.
- NFR-004: The API must return appropriate HTTP status codes.
- NFR-005: Related database changes must preserve transactional consistency.
- NFR-006: The API must expose Swagger documentation.
- NFR-007: The application must include unit and end-to-end tests.
- NFR-008: Database constraints must protect data integrity under concurrent requests.
