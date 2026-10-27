# Spec discrepancies and decisions

| # | Discrepancy | Decision |
|---|---|---|
| 1 | constitution.md lists Jest; the project uses Vitest. | Keep Vitest (already configured). |
| 2 | `@User()` (requirements/security) vs `@CurrentUser()` (authentication spec). | Implemented `User`; `CurrentUser` is an alias. |
| 3 | api.md was truncated after `/workshops`; maintenance endpoints were undefined. | Derived from features/workshop and features/maintenance; now documented in api.md sections 6 and 7. |
| 4 | Invalid state transition: 400 (api.md) vs 409 (maintenance spec). | 409, per the feature spec. |
| 5 | IN_PROGRESS -> CANCELLED refers to an undocumented policy. | Allowed; the vehicle returns to AVAILABLE. |
| 6 | Technicians "own" assignments but no user-mechanic link exists. | Added nullable unique `mechanics.user_id` FK (seeders.md requires an explicit relation). |
| 7 | Default DB name `cachalot_db` vs `fleetcore`. | `fleetcore`. |
| 8 | Inactive related resource on maintenance creation: "rejected", no code given. | 409; missing resource is 404. |
| 9 | Env example uses `DB_SYNCHRONIZE=true` in a reference compose; database.md forbids production sync. | Compose sets `DB_SYNCHRONIZE=false`; schema comes from migrations. |
