# HostBoard local issues

This file is HostBoard's project-local issue tracker. The numbered backlog is
in [tasks.md](tasks.md); GitHub Issues are not used because this repository
contains multiple projects.

Backlog revision: local issues 28-33 are superseded and must not be
implemented. Their frontend-only and narrow integration replacements are
Tasks 34-48 in [tasks.md](tasks.md). Groom those replacement tasks one at a
time before implementation.

## Issue 1. Bootstrap the empty backend project and passing test

Status: Groomed, ready for implementation  
Backlog source: [Task 1](tasks.md#1-bootstrap-the-empty-backend-project-and-passing-test)  
Product source: [specs.md](specs.md)

## Goal

Establish a runnable FastAPI backend foundation for HostBoard and prove its
automated test command works. The foundation must expose only a health check;
it must not begin product functionality.

## Acceptance criteria

- [ ] `pyproject.toml` defines a `uv`-managed Python project with the
  user-approved FastAPI test stack: FastAPI, pytest, and HTTPX.
- [ ] A FastAPI application entry point exists under `backend/`, and starting
  it exposes `GET /health`.
- [ ] `GET /health` returns HTTP 200 and a JSON response whose `status` value
  is `"ok"`.
- [ ] At least one automated test calls the FastAPI application in-process and
  verifies the complete `GET /health` response.
- [ ] From `02-development`, `uv run pytest` exits successfully with at least
  one collected and passing test.
- [ ] No endpoint other than `GET /health` is added.
- [ ] No product database model, migration, authentication behavior, or
  frontend file is added or changed.

## Out of scope

- Authentication and staff OpenAPI endpoints, moved to
  [Task 2](tasks.md#2-document-authentication-and-staff-openapi-endpoints).
- Guest-entry OpenAPI endpoints, moved to
  [Task 3](tasks.md#3-document-guest-entry-openapi-endpoints).
- Table and reporting OpenAPI endpoints, moved to
  [Task 4](tasks.md#4-document-table-and-reporting-openapi-endpoints).
- PostgreSQL models and migrations, moved to
  [Tasks 5-8](tasks.md#5-add-staff-and-restaurant-table-persistence-models).
- Secure password handling and sign-in behavior, moved to
  [Tasks 9-10](tasks.md#9-implement-secure-password-handling).
- Replacing frontend mock calls, moved to
  [Tasks 28-31](tasks.md#28-connect-frontend-sign-in-to-the-fastapi-api).

## Constraints

- Work only in `pyproject.toml`, `uv.lock`, `backend/`, and `tests/`; create
  those paths if they do not yet exist.
- Use the user-selected FastAPI stack and `uv`; add only FastAPI, pytest, and
  HTTPX dependencies required for this foundation.
- Use `pytest` and HTTPX ASGI transport or FastAPI's compatible in-process
  test client; do not require a manually running server for the automated test.
- Keep the frontend prototype under `frontent/` unchanged. Its spelling is
  intentional and is not part of this task.
- Do not configure PostgreSQL, SQLAlchemy, Alembic, authentication, or any
  business endpoint in this task.
- Record the exact setup and test commands in the implementation note after
  the work is complete.

## Issue 2. Document authentication and staff OpenAPI endpoints

Status: Groomed. Backlog: [Task 2](tasks.md#2-document-authentication-and-staff-openapi-endpoints).

## Goal

Define the authentication and staff-management API contract before route implementation.

## Acceptance criteria

- [ ] OpenAPI documents sign-in, sign-out, current-user, staff creation, role change, and activation-change requests and responses.
- [ ] Each endpoint states authentication, allowed role, validation, and forbidden outcomes; credentials never appear in staff responses.

## Out of scope

- Password implementation is [Task 9](tasks.md#9-implement-secure-password-handling); sign-in behavior is [Task 10](tasks.md#10-implement-active-staff-sign-in-and-sign-out).

## Constraints

- Change only API-schema files and contract tests; add no models, persistence, routes, or frontend changes.

## Issue 3. Document guest-entry OpenAPI endpoints

Status: Groomed. Backlog: [Task 3](tasks.md#3-document-guest-entry-openapi-endpoints).

## Goal

Define the guest-entry creation, retrieval, search, and status-action API contract.

## Acceptance criteria

- [ ] OpenAPI distinguishes walk-in and reservation payloads and documents required fields, list/search results, and status timestamps.
- [ ] The contract documents immutable guest details, role restrictions, validation failures, and assigned-table data needed by dashboards.

## Out of scope

- Endpoint behavior is [Tasks 12-14](tasks.md#12-create-walk-ins-through-the-api) and [Task 21](tasks.md#21-create-reservations-through-the-api).

## Constraints

- Change only API-schema files and contract tests; add no models, persistence, routes, or frontend changes.

## Issue 4. Document table and reporting OpenAPI endpoints

Status: Groomed. Backlog: [Task 4](tasks.md#4-document-table-and-reporting-openapi-endpoints).

## Goal

Define the table-operation and daily-report API contract.

## Acceptance criteria

- [ ] OpenAPI documents table configuration, assignment, seating, release, table-map state, and daily-report request and response schemas.
- [ ] Capacity and reservation-overlap warnings have explicit response shapes, and every protected endpoint documents role and forbidden outcomes.

## Out of scope

- Table workflow behavior is [Tasks 15-23](tasks.md#15-create-and-list-restaurant-tables); metric calculations are [Tasks 26-27](tasks.md#26-calculate-daily-wait-and-lost-party-metrics).

## Constraints

- Change only API-schema files and contract tests; preserve manual selection and non-blocking warning rules.

## Issue 5. Add staff and restaurant-table persistence models

Status: Groomed. Backlog: [Task 5](tasks.md#5-add-staff-and-restaurant-table-persistence-models).

## Goal

Represent staff accounts and physical restaurant tables in SQLAlchemy.

## Acceptance criteria

- [ ] Staff has name, credential-hash field, valid role, active flag, and creation timestamp; tables have unique label, positive capacity, availability, and active flag.
- [ ] Model tests reject invalid roles, duplicate labels, and non-positive capacities.

## Out of scope

- Guest and assignment models are [Tasks 6-7](tasks.md#6-add-guest-entry-persistence-models); migration generation is [Task 8](tasks.md#8-create-and-verify-the-initial-postgresql-migration).

## Constraints

- Change only backend model and model-test files; use PostgreSQL-compatible SQLAlchemy types and add no routes or migration.

## Issue 6. Add guest-entry persistence models

Status: Groomed. Backlog: [Task 6](tasks.md#6-add-guest-entry-persistence-models).

## Goal

Represent immutable walk-in and reservation details and lifecycle timestamps in SQLAlchemy.

## Acceptance criteria

- [ ] The model stores all specified guest fields, entry type, status, creator, creation time, and applicable status timestamps.
- [ ] Tests reject non-positive party size and reservations without date or time, while allowing only the defined entry types and statuses.

## Out of scope

- Assignments are [Task 7](tasks.md#7-add-table-assignment-persistence-models); routes are [Tasks 12-14](tasks.md#12-create-walk-ins-through-the-api) and [Task 21](tasks.md#21-create-reservations-through-the-api).

## Constraints

- Change only backend model and model-test files; add no migration, route, or frontend change.

## Issue 7. Add table-assignment persistence models

Status: Groomed. Backlog: [Task 7](tasks.md#7-add-table-assignment-persistence-models).

## Goal

Persist each historical guest-to-table assignment.

## Acceptance criteria

- [ ] An assignment references one guest and one table, records type and assigned time, and permits multiple assignments for one guest.
- [ ] An optional release time preserves, rather than deletes, the assignment; tests verify this history.

## Out of scope

- Migration is [Task 8](tasks.md#8-create-and-verify-the-initial-postgresql-migration); assignment and release behavior are [Tasks 17](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry) and [20](tasks.md#20-release-an-occupied-table).

## Constraints

- Change only backend model and model-test files; do not create a combined-table record or API route.

## Issue 8. Create and verify the initial PostgreSQL migration

Status: Groomed. Backlog: [Task 8](tasks.md#8-create-and-verify-the-initial-postgresql-migration).

## Goal

Make the existing core schema reproducible in an empty PostgreSQL database.

## Acceptance criteria

- [ ] A versioned migration creates the four core tables, constraints, and foreign keys.
- [ ] It applies successfully to an isolated clean PostgreSQL test database and the automated test setup can start cleanly.

## Out of scope

- Model definition is [Tasks 5-7](tasks.md#5-add-staff-and-restaurant-table-persistence-models); product behavior is [Tasks 9-27](tasks.md#9-implement-secure-password-handling).

## Constraints

- Change only migration, database configuration, and migration-test files; never target a production database or add seed data.

## Issue 9. Implement secure password handling

Status: Groomed. Backlog: [Task 9](tasks.md#9-implement-secure-password-handling).

## Goal

Store and verify staff passwords securely.

## Acceptance criteria

- [ ] Passwords are stored as one-way hashes and omitted from all public staff serialization.
- [ ] Tests prove correct-password acceptance and incorrect-password rejection.

## Out of scope

- Authentication routes are [Task 10](tasks.md#10-implement-active-staff-sign-in-and-sign-out); manager account creation is [Task 24](tasks.md#24-create-manager-controlled-staff-accounts).

## Constraints

- Change only security helpers and tests; use a maintained approved hashing library and implement no tokens, sessions, routes, or frontend changes.

## Issue 10. Implement active-staff sign-in and sign-out

Status: Groomed. Backlog: [Task 10](tasks.md#10-implement-active-staff-sign-in-and-sign-out).

## Goal

Authenticate active staff and let them end the authenticated session.

## Acceptance criteria

- [ ] Valid active credentials return the documented authenticated response; invalid credentials return a non-enumerating failure.
- [ ] A deactivated account is denied, and sign-out invalidates the active session or token.

## Out of scope

- Password helpers are [Task 9](tasks.md#9-implement-secure-password-handling); authorization helpers are [Task 11](tasks.md#11-implement-reusable-role-authorization); UI work is [Task 28](tasks.md#28-connect-frontend-sign-in-to-the-fastapi-api).

## Constraints

- Change only backend authentication, route, and test files; match Issue 2 and use in-process API tests.

## Issue 11. Implement reusable role authorization

Status: Groomed. Backlog: [Task 11](tasks.md#11-implement-reusable-role-authorization).

## Goal

Provide reusable current-user and role checks for FastAPI routes.

## Acceptance criteria

- [ ] Routes can require an authenticated staff account and host, server, or manager capability through shared dependencies.
- [ ] Managers satisfy host and server checks, and lacking roles receive the documented forbidden response.

## Out of scope

- Sign-in is [Task 10](tasks.md#10-implement-active-staff-sign-in-and-sign-out); applying checks to product routes belongs to each respective task.

## Constraints

- Change only authorization helpers and tests, plus a minimal protected test route if needed; do not add product workflows or UI changes.

## Issue 12. Create walk-ins through the API

Status: Groomed. Backlog: [Task 12](tasks.md#12-create-walk-ins-through-the-api).

## Goal

Allow a host or manager to create a valid Waiting walk-in.

## Acceptance criteria

- [ ] Authorized host and manager calls create a Waiting entry with required fields, creator, and creation timestamp.
- [ ] Missing required fields, invalid party size, and server access are rejected; automated API tests cover each result.

## Out of scope

- Immutability is [Task 13](tasks.md#13-prevent-guest-detail-edits-after-creation); search is [Task 14](tasks.md#14-list-and-search-guest-entries).

## Constraints

- Change guest-creation route, schemas, and tests only; use Issue 3 and do not add reservation or table behavior.

## Issue 13. Prevent guest-detail edits after creation

Status: Groomed. Backlog: [Task 13](tasks.md#13-prevent-guest-detail-edits-after-creation).

## Goal

Enforce immutable guest details after an entry is created.

## Acceptance criteria

- [ ] No supported API request changes party name, size, phone, request, arrival, or reservation fields after creation.
- [ ] Regression tests prove lifecycle actions may change only permitted status and assignment data.

## Out of scope

- Status actions are [Tasks 18-19](tasks.md#18-seat-an-assigned-guest-atomically); frontend handling is [Task 29](tasks.md#29-connect-host-entry-search-and-reservation-frontend-calls).

## Constraints

- Change only guest route/schema tests or endpoint exposure needed to enforce the rule; do not alter original records.

## Issue 14. List and search guest entries

Status: Groomed. Backlog: [Task 14](tasks.md#14-list-and-search-guest-entries).

## Goal

Let authorized staff retrieve active and historical entries by name or phone.

## Acceptance criteria

- [ ] List and search return dashboard fields for walk-ins and reservations, including assigned-table information.
- [ ] Partial name and phone matches work, and seated, cancelled, and no-show entries remain retrievable as history.

## Out of scope

- Entry creation is [Tasks 12](tasks.md#12-create-walk-ins-through-the-api) and [21](tasks.md#21-create-reservations-through-the-api); UI wiring is [Task 29](tasks.md#29-connect-host-entry-search-and-reservation-frontend-calls).

## Constraints

- Change only guest query routes, schemas, and tests; apply Issue 3 role rules and do not delete records.

## Issue 15. Create and list restaurant tables

Status: Groomed. Backlog: [Task 15](tasks.md#15-create-and-list-restaurant-tables).

## Goal

Let managers configure and view valid individual tables.

## Acceptance criteria

- [ ] A manager can create and list tables with unique labels and positive capacities.
- [ ] Duplicate labels, invalid capacities, and non-manager calls are rejected, and output supports the map.

## Out of scope

- Deactivation is [Task 16](tasks.md#16-deactivate-restaurant-tables); map-state projection is [Task 23](tasks.md#23-produce-current-table-map-availability).

## Constraints

- Change table configuration routes, schemas, and tests only; do not implement assignment or frontend work.

## Issue 16. Deactivate restaurant tables

Status: Groomed. Backlog: [Task 16](tasks.md#16-deactivate-restaurant-tables).

## Goal

Allow managers to remove a table from future service without losing history.

## Acceptance criteria

- [ ] A manager can change a table's active state and non-managers are denied.
- [ ] An inactive table cannot be newly assigned, while existing historical assignments still resolve.

## Out of scope

- New assignment behavior is [Task 17](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry); physical deletion is not an MVP feature.

## Constraints

- Change table activation routes, schemas, and tests only; preserve records and do not update map UI.

## Issue 17. Assign one or more tables to a guest entry

Status: Groomed. Backlog: [Task 17](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry).

## Goal

Let a host or manager save a manual, multi-table selection for a waiting guest.

## Acceptance criteria

- [ ] One or more active available tables can be assigned to a waiting guest, and unknown, inactive, or unavailable tables are rejected.
- [ ] Under-capacity assignment returns a non-blocking warning and intentional assignment persists.

## Out of scope

- Seating is [Task 18](tasks.md#18-seat-an-assigned-guest-atomically); reservation overlap is [Task 22](tasks.md#22-detect-and-confirm-reservation-table-overlaps).

## Constraints

- Change assignment routes, schemas, and tests only; hosts choose tables manually and no automatic recommendation is added.

## Issue 18. Seat an assigned guest atomically

Status: Groomed. Backlog: [Task 18](tasks.md#18-seat-an-assigned-guest-atomically).

## Goal

Seat an assigned guest and occupy every assigned table as one transaction.

## Acceptance criteria

- [ ] Seating requires at least one assignment and records the seated timestamp.
- [ ] On success every assigned table is Occupied; a failed update leaves neither guest nor table in a partial state.

## Out of scope

- Assignment selection is [Task 17](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry); release is [Task 20](tasks.md#20-release-an-occupied-table).

## Constraints

- Change seating route, transaction logic, and tests only; apply host/manager authorization.

## Issue 19. Cancel or mark a guest as no-show

Status: Groomed. Backlog: [Task 19](tasks.md#19-cancel-or-mark-a-guest-as-no-show).

## Goal

Record cancellation or no-show outcomes without losing guest history.

## Acceptance criteria

- [ ] Authorized actions set the correct status and timestamp while preserving original guest details and assignments.
- [ ] Tables held only for that entry become Available where applicable, and server calls are denied.

## Out of scope

- Seating is [Task 18](tasks.md#18-seat-an-assigned-guest-atomically); release of occupied tables is [Task 20](tasks.md#20-release-an-occupied-table).

## Constraints

- Change only status-action routes, state logic, and tests; do not delete guest records.

## Issue 20. Release an occupied table

Status: Groomed. Backlog: [Task 20](tasks.md#20-release-an-occupied-table).

## Goal

Let a server or manager explicitly return an occupied table to Available.

## Acceptance criteria

- [ ] A server or manager can release an occupied table, which receives a release timestamp and Available state.
- [ ] Hosts and non-occupied tables are rejected, and the historical assignment remains present.

## Out of scope

- Seating is [Task 18](tasks.md#18-seat-an-assigned-guest-atomically); map-state display is [Task 23](tasks.md#23-produce-current-table-map-availability).

## Constraints

- Change only release route, state logic, and tests; do not add guest editing or frontend code.

## Issue 21. Create reservations through the API

Status: Groomed. Backlog: [Task 21](tasks.md#21-create-reservations-through-the-api).

## Goal

Create valid reservation records through the authorized API.

## Acceptance criteria

- [ ] Host and manager calls create reservations with common guest fields and required local date and time.
- [ ] Missing reservation values, invalid data, and server calls are rejected by automated API tests.

## Out of scope

- Table conflicts are [Task 22](tasks.md#22-detect-and-confirm-reservation-table-overlaps); UI wiring is [Task 29](tasks.md#29-connect-host-entry-search-and-reservation-frontend-calls).

## Constraints

- Change reservation route, schemas, and tests only; preserve the history record and add no conflict behavior.

## Issue 22. Detect and confirm reservation table overlaps

Status: Groomed. Backlog: [Task 22](tasks.md#22-detect-and-confirm-reservation-table-overlaps).

## Goal

Warn before a same-table reservation conflict is intentionally confirmed.

## Acceptance criteria

- [ ] An overlapping table and reservation time returns the documented warning before a conflicting assignment is committed.
- [ ] Explicit confirmation persists the intentional conflict; non-overlapping assignments proceed normally.

## Out of scope

- Initial reservation creation is [Task 21](tasks.md#21-create-reservations-through-the-api); map projection is [Task 23](tasks.md#23-produce-current-table-map-availability).

## Constraints

- Change reservation-assignment conflict logic and tests only; warnings must not be silently bypassed.

## Issue 23. Produce current table-map availability

Status: Groomed. Backlog: [Task 23](tasks.md#23-produce-current-table-map-availability).

## Goal

Return accurate Available, Occupied, and Reserved states for active tables.

## Acceptance criteria

- [ ] The map query reports each active table's capacity, label, and current availability state.
- [ ] Tests cover occupancy, upcoming reservation, and reservation-to-seated transition priority.

## Out of scope

- Table configuration is [Tasks 15-16](tasks.md#15-create-and-list-restaurant-tables); frontend rendering is [Task 30](tasks.md#30-connect-table-assignment-and-server-release-frontend-calls).

## Constraints

- Change table-map query/projection and tests only; do not create automatic table recommendations.

## Issue 24. Create manager-controlled staff accounts

Status: Groomed. Backlog: [Task 24](tasks.md#24-create-manager-controlled-staff-accounts).

## Goal

Let a manager add an active staff account with a valid role.

## Acceptance criteria

- [ ] A manager can create host, server, or manager accounts with securely handled credentials.
- [ ] Invalid roles and non-manager calls are rejected, and responses exclude credentials.

## Out of scope

- Hashing is [Task 9](tasks.md#9-implement-secure-password-handling); role and status changes are [Task 25](tasks.md#25-change-staff-role-and-active-status).

## Constraints

- Change staff-creation route, schemas, and tests only; use Issue 2 contract and no frontend changes.

## Issue 25. Change staff role and active status

Status: Groomed. Backlog: [Task 25](tasks.md#25-change-staff-role-and-active-status).

## Goal

Let managers maintain staff roles and sign-in eligibility while preserving attribution.

## Acceptance criteria

- [ ] A manager can change a valid role and independently activate or deactivate an account.
- [ ] Deactivation blocks a subsequent sign-in and prior guest-entry attribution remains intact.

## Out of scope

- Account creation is [Task 24](tasks.md#24-create-manager-controlled-staff-accounts); authentication implementation is [Task 10](tasks.md#10-implement-active-staff-sign-in-and-sign-out).

## Constraints

- Change staff maintenance routes, schemas, and tests only; never delete staff history.

## Issue 26. Calculate daily wait and lost-party metrics

Status: Groomed. Backlog: [Task 26](tasks.md#26-calculate-daily-wait-and-lost-party-metrics).

## Goal

Calculate manager daily waits, cancellations, and no-shows from persisted timestamps.

## Acceptance criteria

- [ ] A local-date report returns individual and average waits plus cancellation and no-show counts.
- [ ] Tests cover normal, empty-day, cancellation, no-show, and missing-seating-time data.

## Out of scope

- Turnover and covers are [Task 27](tasks.md#27-calculate-daily-turnover-and-covers-metrics); UI is [Task 31](tasks.md#31-connect-manager-administration-and-reports-frontend-calls).

## Constraints

- Change report calculation/query code and tests only; use restaurant-local date boundaries.

## Issue 27. Calculate daily turnover and covers metrics

Status: Groomed. Backlog: [Task 27](tasks.md#27-calculate-daily-turnover-and-covers-metrics).

## Goal

Calculate table turnover and total seated covers without double counting.

## Acceptance criteria

- [ ] A local-date report returns table turnover and total seated guest count.
- [ ] Tests cover repeated table turns, a combined-table party, and no completed release.

## Out of scope

- Wait and lost-party metrics are [Task 26](tasks.md#26-calculate-daily-wait-and-lost-party-metrics); UI is [Task 31](tasks.md#31-connect-manager-administration-and-reports-frontend-calls).

## Constraints

- Change report calculation/query code and tests only; calculate from persisted seating and release history.

## Issue 28. Connect frontend sign-in to the FastAPI API

Status: Groomed. Backlog: [Task 28](tasks.md#28-connect-frontend-sign-in-to-the-fastapi-api).

## Goal

Replace production mock profile switching with real staff authentication.

## Acceptance criteria

- [ ] The centralized frontend API module signs in, signs out, and obtains the authenticated user through FastAPI.
- [ ] Sign-in failures are visible and mock-only profile switching is unavailable in the production flow.

## Out of scope

- Backend authentication is [Tasks 9-11](tasks.md#9-implement-secure-password-handling); other frontend calls are [Tasks 29-31](tasks.md#29-connect-host-entry-search-and-reservation-frontend-calls).

## Constraints

- Change only the centralized frontend API module and sign-in UI; do not move requests into `app.js` or change backend behavior.

## Issue 29. Connect host entry, search, and reservation frontend calls

Status: Groomed. Backlog: [Task 29](tasks.md#29-connect-host-entry-search-and-reservation-frontend-calls).

## Goal

Use live guest-entry APIs in the existing host UI.

## Acceptance criteria

- [ ] Creating walk-ins/reservations, loading lists, and name-or-phone search use centralized HTTP calls.
- [ ] Validation errors and reservation-overlap confirmation are visible without changing the existing UI structure.

## Out of scope

- Backend behavior is [Tasks 12-14](tasks.md#12-create-walk-ins-through-the-api) and [21-22](tasks.md#21-create-reservations-through-the-api); table actions are [Task 30](tasks.md#30-connect-table-assignment-and-server-release-frontend-calls).

## Constraints

- Change `frontent/api.js` and necessary host UI bindings only; do not put request logic in `app.js`.

## Issue 30. Connect table assignment and server-release frontend calls

Status: Groomed. Backlog: [Task 30](tasks.md#30-connect-table-assignment-and-server-release-frontend-calls).

## Goal

Persist floor-map actions and server releases through the API.

## Acceptance criteria

- [ ] Map loading, assignment, seating, status changes, and release use centralized HTTP calls and refresh visible state.
- [ ] Capacity warnings, role-aware controls, and server-ready action remain usable after integration.

## Out of scope

- Backend workflow behavior is [Tasks 17-20](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry); browser acceptance is [Tasks 32-33](tasks.md#32-verify-the-host-workflow-in-a-browser).

## Constraints

- Change `frontent/api.js` and necessary floor/server UI bindings only; preserve manual selection and do not move request logic into `app.js`.

## Issue 31. Connect manager administration and reports frontend calls

Status: Groomed. Backlog: [Task 31](tasks.md#31-connect-manager-administration-and-reports-frontend-calls).

## Goal

Use live staff, table, and reporting data in manager screens.

## Acceptance criteria

- [ ] Staff management, table configuration, and daily reports use centralized HTTP calls.
- [ ] Manager-only controls remain role-aware and display API errors without breaking existing layout.

## Out of scope

- Backend administration is [Tasks 15-16](tasks.md#15-create-and-list-restaurant-tables) and [24-27](tasks.md#24-create-manager-controlled-staff-accounts); browser acceptance is [Task 33](tasks.md#33-verify-server-and-manager-workflows-in-a-browser).

## Constraints

- Change `frontent/api.js` and required manager UI bindings only; do not change backend rules or place request logic in `app.js`.

## Issue 32. Verify the host workflow in a browser

Status: Groomed. Backlog: [Task 32](tasks.md#32-verify-the-host-workflow-in-a-browser).

## Goal

Verify the complete host MVP workflow against the running application.

## Acceptance criteria

- [ ] Browser evidence covers walk-in creation, search, multi-table selection, capacity warning, seating, reservation creation, and overlap confirmation.
- [ ] Host access to manager actions is denied, and host desktop/tablet views have no horizontal overflow.

## Out of scope

- Server and manager browser verification is [Task 33](tasks.md#33-verify-server-and-manager-workflows-in-a-browser).

## Constraints

- Do not change application code; use the QA procedure and running FastAPI/PostgreSQL environment.

## Issue 34. Define frontend mock fixtures and API-boundary contract

Status: Groomed. Backlog: [Task 34](tasks.md#34-define-frontend-mock-fixtures-and-api-boundary-contract).

## Goal

Make `frontent/api.js` a deterministic mock boundary for independent UI work.

## Acceptance criteria

- [ ] Every screen-needed mock response, error, and asynchronous method is documented and reproducible from controlled fixtures.
- [ ] UI files make no HTTP calls and the rendered UI is unchanged.

## Out of scope

- UI implementation is [Tasks 35-41](tasks.md#35-build-the-sign-in-and-authenticated-shell-frontend-flow); HTTP integration is [Tasks 42-48](tasks.md#42-integrate-frontend-authentication-with-fastapi).

## Constraints

- Change only `frontent/api.js` and its documentation/tests; retain centralized asynchronous behavior.

## Issue 35. Build the sign-in and authenticated-shell frontend flow

Status: Groomed. Backlog: [Task 35](tasks.md#35-build-the-sign-in-and-authenticated-shell-frontend-flow).

## Goal

Render mock sign-in, failure, and role-specific authenticated shells.

## Acceptance criteria

- [ ] Mock sign-in success and failure are visibly distinguishable, and active user identity is shown after success.
- [ ] Host, server, and manager navigation and controls differ according to the specification without a running backend.

## Out of scope

- Mock contract is [Task 34](tasks.md#34-define-frontend-mock-fixtures-and-api-boundary-contract); live auth is [Task 42](tasks.md#42-integrate-frontend-authentication-with-fastapi).

## Constraints

- Use `frontent/api.js` only; do not add HTTP calls or backend code.

## Issue 36. Build the host waitlist frontend flow

Status: Groomed. Backlog: [Task 36](tasks.md#36-build-the-host-waitlist-frontend-flow).

## Goal

Let a host use mock data to create, view, and search walk-ins.

## Acceptance criteria

- [ ] The waitlist shows required active-party fields, supports a walk-in form, and visibly presents mock validation errors.
- [ ] Name-or-phone search works with mock data and desktop/tablet layouts have no horizontal overflow.

## Out of scope

- Tables are [Task 37](tasks.md#37-build-the-host-table-assignment-frontend-flow); live calls are [Task 43](tasks.md#43-integrate-the-host-waitlist-with-fastapi).

## Constraints

- Use `frontent/api.js` mock methods only; preserve the current responsive UI structure.

## Issue 37. Build the host table-assignment frontend flow

Status: Groomed. Backlog: [Task 37](tasks.md#37-build-the-host-table-assignment-frontend-flow).

## Goal

Let a host manually select mock tables and review capacity.

## Acceptance criteria

- [ ] One or more available mock tables can be selected and the assignment summary updates.
- [ ] Under-capacity selection shows a non-blocking warning; no automatic recommendation or HTTP call is used.

## Out of scope

- Reservations are [Task 38](tasks.md#38-build-the-reservation-frontend-flow); live integration is [Task 45](tasks.md#45-integrate-table-assignment-and-seating-with-fastapi).

## Constraints

- Use mock data only and preserve manual table selection.

## Issue 38. Build the reservation frontend flow

Status: Groomed. Backlog: [Task 38](tasks.md#38-build-the-reservation-frontend-flow).

## Goal

Let a host create and review mock reservations with explicit conflict handling.

## Acceptance criteria

- [ ] Reservation-specific fields, list entries, and creation feedback render from mock data.
- [ ] An overlap warning requires a visible confirmation choice and is usable on tablet widths.

## Out of scope

- Live integration is [Task 44](tasks.md#44-integrate-reservations-with-fastapi).

## Constraints

- Use `frontent/api.js` mocks only; do not implement backend conflict logic.

## Issue 39. Build the server frontend flow

Status: Groomed. Backlog: [Task 39](tasks.md#39-build-the-server-frontend-flow).

## Goal

Let a server view mock occupied tables and mark one ready.

## Acceptance criteria

- [ ] The server sees assigned table, party, size, request, and a ready action from mock data.
- [ ] Host-only controls are absent and mock release visibly refreshes the table state.

## Out of scope

- Live integration is [Task 46](tasks.md#46-integrate-the-server-flow-with-fastapi).

## Constraints

- Use mock methods only; do not add backend calls.

## Issue 40. Build manager staff and table administration frontend flows

Status: Groomed. Backlog: [Task 40](tasks.md#40-build-manager-staff-and-table-administration-frontend-flows).

## Goal

Let a manager administer mock staff and table configuration.

## Acceptance criteria

- [ ] Mock staff creation, role/active controls, and table configuration are visible only to a manager.
- [ ] Guest workflows and reporting remain unchanged.

## Out of scope

- Reporting is [Task 41](tasks.md#41-build-the-manager-reporting-frontend-flow); live integration is [Task 47](tasks.md#47-integrate-manager-administration-with-fastapi).

## Constraints

- Use the mock API boundary only.

## Issue 41. Build the manager reporting frontend flow

Status: Groomed. Backlog: [Task 41](tasks.md#41-build-the-manager-reporting-frontend-flow).

## Goal

Render mock daily operational reports for managers.

## Acceptance criteria

- [ ] Wait, lost-party, turnover, and covers metrics render from mock API data.
- [ ] Empty and populated report states are visibly distinct.

## Out of scope

- Live reports are [Task 48](tasks.md#48-integrate-manager-reports-with-fastapi).

## Constraints

- Use mock data only and do not implement report calculations.

## Issue 42. Integrate frontend authentication with FastAPI

Status: Groomed. Backlog: [Task 42](tasks.md#42-integrate-frontend-authentication-with-fastapi).

## Goal

Replace mock authentication with the completed FastAPI endpoints.

## Acceptance criteria

- [ ] Sign-in, failure, current-user, and sign-out use the centralized API module against the running backend.
- [ ] The Task 35 UI behavior remains intact and succeeds and fails correctly with live data.

## Out of scope

- Auth backend work is [Tasks 9-11](tasks.md#9-implement-secure-password-handling); other UI integration is [Tasks 43-48](tasks.md#43-integrate-the-host-waitlist-with-fastapi).

## Constraints

- Change only `frontent/api.js` and necessary sign-in bindings; no requests in `app.js`.

## Issue 43. Integrate the host waitlist with FastAPI

Status: Groomed. Backlog: [Task 43](tasks.md#43-integrate-the-host-waitlist-with-fastapi).

## Goal

Replace live walk-in list, creation, and search mocks only.

## Acceptance criteria

- [ ] Waitlist load, creation, validation errors, and name-or-phone search use the live API.
- [ ] The Task 36 UI and responsive behavior remain intact; reservations and tables remain untouched.

## Out of scope

- Backend is [Tasks 12-14](tasks.md#12-create-walk-ins-through-the-api); reservations are [Task 44](tasks.md#44-integrate-reservations-with-fastapi).

## Constraints

- Change centralized API code and necessary waitlist bindings only.

## Issue 44. Integrate reservations with FastAPI

Status: Groomed. Backlog: [Task 44](tasks.md#44-integrate-reservations-with-fastapi).

## Goal

Replace reservation mocks with live creation, listing, and confirmation calls.

## Acceptance criteria

- [ ] Reservation creation, listing, and overlap confirmation call the live API through `frontent/api.js`.
- [ ] The Task 38 warning interaction remains explicit and works for success and API error responses.

## Out of scope

- Backend is [Tasks 21-22](tasks.md#21-create-reservations-through-the-api); table seating is [Task 45](tasks.md#45-integrate-table-assignment-and-seating-with-fastapi).

## Constraints

- Preserve the existing UI and make no request directly from `app.js`.

## Issue 45. Integrate table assignment and seating with FastAPI

Status: Groomed. Backlog: [Task 45](tasks.md#45-integrate-table-assignment-and-seating-with-fastapi).

## Goal

Replace mock map, assignment, warning, and seating calls with live APIs.

## Acceptance criteria

- [ ] Map state, assignments, capacity warnings, and seating call the live API and visibly refresh.
- [ ] Manual selection and Task 37 warning behavior remain intact.

## Out of scope

- Backend is [Tasks 17-18](tasks.md#17-assign-one-or-more-tables-to-a-guest-entry); server release is [Task 46](tasks.md#46-integrate-the-server-flow-with-fastapi).

## Constraints

- Centralize HTTP in `frontent/api.js`; do not alter backend business rules.

## Issue 46. Integrate the server flow with FastAPI

Status: Groomed. Backlog: [Task 46](tasks.md#46-integrate-the-server-flow-with-fastapi).

## Goal

Replace mock server tables and release with live APIs.

## Acceptance criteria

- [ ] Assigned-table display and ready action call the live API and refresh state.
- [ ] Backend denial remains visible if a forbidden role invokes the action.

## Out of scope

- Backend is [Task 20](tasks.md#20-release-an-occupied-table); manager UI is [Task 47](tasks.md#47-integrate-manager-administration-with-fastapi).

## Constraints

- Change the centralized API module and necessary server bindings only.

## Issue 47. Integrate manager administration with FastAPI

Status: Groomed. Backlog: [Task 47](tasks.md#47-integrate-manager-administration-with-fastapi).

## Goal

Replace mock staff and table management with live APIs.

## Acceptance criteria

- [ ] Staff and table actions call documented live endpoints through the centralized API module.
- [ ] Manager-only controls and visible API error handling remain intact.

## Out of scope

- Backend is [Tasks 15-16](tasks.md#15-create-and-list-restaurant-tables) and [24-25](tasks.md#24-create-manager-controlled-staff-accounts); reports are [Task 48](tasks.md#48-integrate-manager-reports-with-fastapi).

## Constraints

- Do not change report UI, backend rules, or put requests in `app.js`.

## Issue 48. Integrate manager reports with FastAPI

Status: Groomed. Backlog: [Task 48](tasks.md#48-integrate-manager-reports-with-fastapi).

## Goal

Replace mock report data with the live local-date report API.

## Acceptance criteria

- [ ] The manager report calls the live API and renders its requested local-date metrics.
- [ ] Empty and populated live responses render correctly without changing report calculations in the frontend.

## Out of scope

- Backend metrics are [Tasks 26-27](tasks.md#26-calculate-daily-wait-and-lost-party-metrics); full browser QA remains [Issues 32-33](#issue-32-verify-the-host-workflow-in-a-browser).

## Constraints

- Change the centralized API module and report binding only; do not calculate metrics client-side.

## Issue 33. Verify server and manager workflows in a browser

Status: Groomed. Backlog: [Task 33](tasks.md#33-verify-server-and-manager-workflows-in-a-browser).

## Goal

Verify the remaining role workflows and reports against persisted data.

## Acceptance criteria

- [ ] Browser evidence covers server assigned-table viewing and release, plus manager staff/table administration and daily report metrics.
- [ ] Forbidden role requests are denied and the relevant desktop/tablet layouts remain usable.

## Out of scope

- None; this is the final MVP browser-verification task.

## Constraints

- Do not change application code; use the QA procedure and running FastAPI/PostgreSQL environment.
