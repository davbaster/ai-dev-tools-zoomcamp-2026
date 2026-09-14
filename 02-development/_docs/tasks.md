# HostBoard implementation backlog

## 1. Bootstrap the empty backend project and passing test
Goal: Create the FastAPI project foundation with one passing automated test.
Description: Set up the Python project, FastAPI application entry point, test configuration, and a minimal health endpoint. Use `uv run pytest` to prove the suite runs successfully; do not add product endpoints, authentication, or database models in this task.

## 2. Document authentication and staff OpenAPI endpoints
Goal: Define the API contract for sign-in and manager staff actions.
Description: Document request and response schemas for sign-in, sign-out, current-user lookup, staff creation, role assignment, and activation changes. State the required role and expected authorization outcomes for every endpoint, without implementing routes or persistence.

## 3. Document guest-entry OpenAPI endpoints
Goal: Define the API contract for walk-ins, reservations, status actions, lists, and search.
Description: Document schemas and error responses for creating guest entries, listing them, searching by name or phone, and performing status changes. Include the immutable-detail rule and the fields required by the host and server dashboards, without implementing routes or persistence.

## 4. Document table and reporting OpenAPI endpoints
Goal: Define the API contract for tables, assignments, release actions, and daily reports.
Description: Document schemas for manager table configuration, multi-table assignment, seating, release, reservation-conflict warnings, and report responses. Specify the capacity-warning and overlap-confirmation response shapes so the frontend can require an intentional decision.

## 5. Add staff and restaurant-table persistence models
Goal: Represent staff accounts and restaurant tables in SQLAlchemy.
Description: Create models for staff accounts and restaurant tables with the required identifiers, roles, credentials fields, active flags, capacities, and availability fields. Add unit tests for uniqueness and positive-capacity constraints without adding guest-entry persistence.

## 6. Add guest-entry persistence models
Goal: Represent immutable walk-in and reservation records in SQLAlchemy.
Description: Create the guest-entry model with required guest fields, entry type, status, local-time fields, creator attribution, and status timestamps. Add model-level validation tests for positive party size and reservation-specific date and time requirements.

## 7. Add table-assignment persistence models
Goal: Persist a guest party's relationship to one or more tables.
Description: Create the assignment model with guest entry, restaurant table, assignment type, assigned timestamp, and release timestamp. Verify it supports multiple tables per guest without deleting the assignment when a table later becomes available.

## 8. Create and verify the initial PostgreSQL migration
Goal: Make the core HostBoard schema reproducible in PostgreSQL.
Description: Generate an initial migration for the existing staff, table, guest-entry, and assignment models. Apply it to an isolated PostgreSQL test database and verify upgrade and clean-database setup in automated tests.

## 9. Implement secure password handling
Goal: Store staff passwords securely rather than as plaintext.
Description: Add password hashing and verification helpers appropriate for the selected authentication design. Test that correct credentials validate, incorrect credentials fail, and stored values cannot be used as passwords directly.

## 10. Implement active-staff sign-in and sign-out
Goal: Let active staff authenticate and end their authenticated session.
Description: Implement the documented sign-in and sign-out endpoints using the password helpers and chosen session or token mechanism. Test valid credentials, invalid credentials, and denial of a deactivated account.

## 11. Implement reusable role authorization
Goal: Provide a single backend mechanism for host, server, and manager permission checks.
Description: Add reusable current-user and role-check dependencies for FastAPI routes. Test that managers satisfy host and server permissions, while unauthorized roles receive the documented denial response.

## 12. Create walk-ins through the API
Goal: Let a host or manager create a Waiting walk-in with all required details.
Description: Implement the walk-in creation endpoint with input validation, automatic creation timestamp, and creator attribution. Test allowed host and manager calls, required fields, and invalid party sizes.

## 13. Prevent guest-detail edits after creation
Goal: Enforce the specification's immutable guest-detail rule.
Description: Ensure the API exposes no update path for party name, size, phone, special request, or arrival and reservation fields after a guest entry exists. Add regression tests that prove only the dedicated operational actions can alter an entry's lifecycle data.

## 14. List and search guest entries
Goal: Let authorized staff find waitlist entries and reservations by name or phone.
Description: Implement list and search endpoints with entry type, active/history, and date or service-period filtering needed by the dashboards. Test partial name and phone matches and confirm seated, cancelled, and no-show records remain retrievable as history.

## 15. Create and list restaurant tables
Goal: Let managers configure valid individual tables.
Description: Implement manager-only table creation and listing with unique labels and positive seating capacities. Test duplicate-label rejection, non-manager denial, and a response shape suitable for the table map.

## 16. Deactivate restaurant tables
Goal: Let managers remove a table from future service without deleting its history.
Description: Implement a manager-only activation change for restaurant tables and preserve existing assignments. Test that inactive tables are excluded from new assignments while historical references still resolve.

## 17. Assign one or more tables to a guest entry
Goal: Let a host or manager manually save a valid table selection.
Description: Implement multi-table assignment for a waiting guest and reject inactive, unknown, or unavailable tables. Return a non-blocking capacity warning when combined capacity is smaller than the party size, and test that the assignment is not silently discarded.

## 18. Seat an assigned guest atomically
Goal: Change a guest to Seated and all assigned tables to Occupied together.
Description: Implement the seating action, requiring at least one active assignment before it succeeds. Record the seating timestamp and use a transaction so a failed table update cannot leave the guest and table states inconsistent.

## 19. Cancel or mark a guest as no-show
Goal: Let a host or manager record non-seating outcomes without losing history.
Description: Implement the cancellation and no-show actions with status timestamps and preserved original guest details. Release tables held exclusively for that guest when applicable, and test forbidden server access.

## 20. Release an occupied table
Goal: Let a server or manager explicitly make a ready table Available.
Description: Implement the table-release endpoint with a release timestamp and preservation of the completed assignment record. Test server and manager success, host denial, and rejection of a release request for a non-occupied table.

## 21. Create reservations through the API
Goal: Let a host or manager create a valid historical reservation record.
Description: Implement reservation creation with all common guest fields plus required local reservation date and time. Test role access and invalid or missing reservation-specific values without adding conflict detection in this task.

## 22. Detect and confirm reservation table overlaps
Goal: Prevent a same-table booking conflict from being silently created.
Description: Implement reservation table assignment that detects overlapping bookings and returns the documented warning before committing a conflict. Add the explicit confirmation path and tests that both the warning and the intentional continuation are recorded correctly.

## 23. Produce current table-map availability
Goal: Return Available, Occupied, and Reserved states accurately for active tables.
Description: Implement the backend query or endpoint projection that derives each table's current map state from seating and upcoming reservation data. Test priority and transition cases, including a reservation becoming occupied when its party is seated.

## 24. Create manager-controlled staff accounts
Goal: Let managers add a staff account with an assigned role.
Description: Implement the manager-only staff-creation endpoint using secure password handling and supported host, server, or manager roles. Test valid account creation, invalid roles, and non-manager denial.

## 25. Change staff role and active status
Goal: Let managers maintain staff access without erasing accountability.
Description: Implement separate manager-only actions to change an existing staff role and to activate or deactivate that account. Test that deactivation blocks a subsequent sign-in while prior guest-entry attribution remains intact.

## 26. Calculate daily wait and lost-party metrics
Goal: Return a manager report's individual and average waits, cancellations, and no-shows.
Description: Implement local-restaurant-day filtering and calculations using persisted creation and status timestamps. Test normal, empty-day, cancellation, no-show, and missing-seating-time cases.

## 27. Calculate daily turnover and covers metrics
Goal: Return a manager report's table turnover and total seated covers.
Description: Implement calculations from seating and table-release history without double-counting multi-table parties. Test multiple turns on one table, combined-table seating, and a day with no completed table releases.

## 28. Connect frontend sign-in to the FastAPI API
Goal: Replace mock profile switching with real authenticated staff access.
Description: Update only the centralized frontend API module and sign-in flow to call the documented authentication endpoints and retain the authenticated user state. Show sign-in failures clearly and remove mock-only account switching from the production path.

## 29. Connect host entry, search, and reservation frontend calls
Goal: Make the host dashboards use live guest-entry data.
Description: Replace mock calls for creating walk-ins, creating reservations, loading lists, and searching by name or phone with centralized HTTP calls. Preserve the existing UI structure and display API validation errors and reservation-overlap confirmations.

## 30. Connect table assignment and server-release frontend calls
Goal: Make the floor map and server actions persist through the API.
Description: Replace mock calls for table-map data, assignments, seating, guest status changes, and table release with the documented HTTP calls. Preserve the capacity-warning decision, role-aware controls, and visible refresh of changed table and guest state.

## 31. Connect manager administration and reports frontend calls
Goal: Make manager screens use live staff, table, and reporting data.
Description: Replace mock calls for staff management, table configuration, and daily reports with centralized HTTP calls. Preserve manager-only controls and render API errors without moving request logic into `app.js`.

## 32. Verify the host workflow in a browser
Goal: Confirm a host can complete the specified walk-in and reservation flows.
Description: Against the running FastAPI and PostgreSQL application, test walk-in creation, search, multi-table selection, capacity warning, seating, reservation creation, and overlap confirmation. Verify the host cannot access manager-only actions and that the desktop and tablet host layouts have no horizontal overflow.

## 33. Verify server and manager workflows in a browser
Goal: Confirm server and manager permissions and MVP reporting work end to end.
Description: Test a server's assigned-table and release workflow, then test manager staff/table administration and all daily report metrics against persisted data. Verify role-specific controls and requests are both denied when forbidden, and verify the relevant desktop and tablet layouts remain usable.

## Frontend-only delivery sequence

Tasks 34-41 are independent of the backend and use the asynchronous mock API
in `frontent/api.js`. Complete them before the corresponding HTTP integration
tasks, which are split into Tasks 42-48. Tasks 28-33 are superseded planning
records and must not be implemented; their narrower replacements are Tasks
34-48.

## 34. Define frontend mock fixtures and API-boundary contract
Goal: Make the frontend mock boundary deterministic and ready for independent UI work.
Description: Keep all mock data and asynchronous methods in `frontent/api.js`, and document the response/error shapes each screen consumes. Do not change the rendered UI or make HTTP calls in this task.

## 35. Build the sign-in and authenticated-shell frontend flow
Goal: Let staff enter the appropriate host, server, or manager shell using mock authentication.
Description: Build the sign-in state, failure state, and authenticated user presentation using only `frontent/api.js` mock methods. Verify role-specific navigation and controls render correctly without a running backend.

## 36. Build the host waitlist frontend flow
Goal: Let a host create, view, and search walk-ins against mock data.
Description: Implement the waitlist view, walk-in form, validation presentation, and name-or-phone search through the mock API boundary. Verify the layout at desktop and tablet widths without a backend.

## 37. Build the host table-assignment frontend flow
Goal: Let a host select one or more mock tables and review capacity warnings.
Description: Implement the visual table map selection state, assigned-table summary, and non-blocking under-capacity warning using mock data. Keep manual selection and do not implement HTTP integration or automatic table suggestions.

## 38. Build the reservation frontend flow
Goal: Let a host create and review reservations using mock data.
Description: Implement the reservation form, reservation list, and explicit reservation-overlap warning/confirmation interaction through the mock API boundary. Verify that reservation-specific fields and warning states are usable on tablet widths.

## 39. Build the server frontend flow
Goal: Let a server view its mock occupied tables and mark one ready.
Description: Implement the server-specific assigned-table view, party detail display, and ready action through the mock API boundary. Verify host-only controls are absent and the visible table state refreshes after the mock action.

## 40. Build manager staff and table administration frontend flows
Goal: Let a manager administer mock staff and table configuration.
Description: Implement manager-only staff creation, role/active-state controls, and table configuration UI through the mock API boundary. Keep guest workflows and daily reports out of this task.

## 41. Build the manager reporting frontend flow
Goal: Let a manager view mock daily operational metrics.
Description: Implement the daily report presentation for waits, cancellations/no-shows, turnover, and covers using mock API data. Verify empty and populated report states without requiring backend calculations.

## 42. Integrate frontend authentication with FastAPI
Goal: Replace only mock sign-in calls with the completed authentication API.
Description: Update the centralized API module and sign-in flow to use the documented FastAPI endpoints while preserving the UI from Task 35. Verify success, failure, and sign-out against the running backend.

## 43. Integrate the host waitlist with FastAPI
Goal: Replace only mock walk-in creation, listing, and search calls with live API calls.
Description: Connect the completed host waitlist UI to the documented backend endpoints through `frontent/api.js`. Preserve its validation and responsive behavior, and do not integrate reservations or table assignment in this task.

## 44. Integrate reservations with FastAPI
Goal: Replace only mock reservation calls with live API calls.
Description: Connect the completed reservation UI to creation, listing, and conflict-confirmation endpoints through `frontent/api.js`. Preserve the intentional overlap-warning interaction from Task 38.

## 45. Integrate table assignment and seating with FastAPI
Goal: Replace only mock table-map assignment and seating calls with live API calls.
Description: Connect the completed table-assignment UI to map, assignment, capacity-warning, and seating endpoints through `frontent/api.js`. Preserve manual selection and visible state refresh.

## 46. Integrate the server flow with FastAPI
Goal: Replace only mock server table and ready calls with live API calls.
Description: Connect the server UI from Task 39 to the assigned-table and release endpoints through `frontent/api.js`. Verify role enforcement remains backend-backed as well as visually represented.

## 47. Integrate manager administration with FastAPI
Goal: Replace only mock staff and table-management calls with live API calls.
Description: Connect the manager administration UI from Task 40 to the documented staff and table endpoints through `frontent/api.js`. Preserve visible API error handling and manager-only controls.

## 48. Integrate manager reports with FastAPI
Goal: Replace only mock report data with the live daily-report API.
Description: Connect the reporting UI from Task 41 to the local-date report endpoint through `frontent/api.js`. Verify empty and populated results render correctly with backend data.
