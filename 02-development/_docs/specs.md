# Restaurant Waitlist Manager — Specification

## 1. Product summary

HostBoard is a responsive web application for one restaurant location. It enables hosts, servers, and managers to manage walk-in guests, reservations, individual tables, and daily operational reporting.

Customers do not interact with the application. Staff enter all guest and reservation information, and contact guests outside the system.

## 2. Goals

- Give hosts a current, easy-to-read view of the waitlist, reservations, and table availability.
- Let hosts assign individual or combined tables from a visual table map.
- Help servers know which tables and guest requests they are serving, and let them return tables to service.
- Give managers control over staff accounts and tables, plus daily performance reporting.
- Retain historical records for reporting; do not delete completed operational history.

## 3. Users and permissions

Each employee signs in with an individual account. A user has one of these roles:

| Capability | Host | Server | Manager |
| --- | :---: | :---: | :---: |
| View active waitlist, reservations, and table map | Yes | Yes | Yes |
| Add walk-in guests and reservations | Yes | No | Yes |
| Search guests by name or phone | Yes | Yes | Yes |
| Assign tables and combine tables from the map | Yes | No | Yes |
| Change guest status to seated, cancelled, or no-show | Yes | No | Yes |
| View assigned tables and guest special requests | Yes | Yes | Yes |
| Mark a table available when ready for the next party | No | Yes | Yes |
| Manage tables and their capacity | No | No | Yes |
| Create, deactivate, and assign roles to staff accounts | No | No | Yes |
| View daily reports | No | No | Yes |

Managers retain host and server capabilities.

## 4. Functional requirements

### 4.1 Authentication and staff accounts

- Staff must sign in before accessing the application.
- The application must enforce permissions by role.
- Managers can create staff accounts, assign a role, and deactivate accounts.
- Deactivated staff cannot sign in; their historical actions remain attributable to them.

### 4.2 Walk-in waitlist

Hosts and managers can add a walk-in entry with:

- Guest or party name
- Party size
- Phone number
- Special request
- Estimated arrival time
- Estimated wait time

Each new walk-in starts with the status **Waiting**. The active waitlist must show, at minimum, party name, party size, estimated arrival time, estimated wait time, current status, and whether a table has been assigned.

Allowed guest statuses are:

- Waiting
- Seated
- Cancelled
- No-show

Staff must not edit the guest details or time fields after creation. Staff may perform the allowed operational actions: assign tables and change status. The system must automatically timestamp creation and every status change.

### 4.3 Reservations

Hosts and managers can create a reservation with the same guest details as a walk-in, plus:

- Reservation date
- Reservation time

Reservations must be viewable alongside the current service period and searchable by guest name or phone number. Reservation records are historical data and must be retained.

When a table is associated with a reservation, the system must warn the staff member if its booking overlaps another reservation for the same table. The warning must not silently create a conflicting assignment.

### 4.4 Table map and table lifecycle

- Managers configure individual tables, including a unique table identifier and seating capacity.
- The table map displays each individual table, its capacity, and one of these availability states: **Available**, **Occupied**, or **Reserved**.
- Hosts manually select a table from the map; the app does not automatically choose or suggest tables.
- Hosts may select and combine multiple tables for one party.
- The app must warn, but not block, a host who assigns a party to a table or combined tables whose capacity is smaller than the party size.
- Seating a guest automatically changes all assigned tables to **Occupied**.
- A table remains unavailable after seating until a server or manager explicitly marks it **Available**.
- A table associated with an upcoming reservation displays as **Reserved**.

### 4.5 Service view

- Servers can see tables assigned to service and the relevant party name, party size, and special request.
- Servers cannot create or edit guest/reservation details, assign tables, or change guest statuses.
- Servers can mark an occupied table available when it is ready for the next party.

### 4.6 Search and history

- Staff can search active waitlist entries and reservations by party name or phone number.
- The system retains past records, including seated, cancelled, and no-show entries.
- Historical data supports manager reports and must not be deleted as part of normal staff actions.

### 4.7 Reporting

Managers can view daily reports containing:

- Average and individual wait times
- Cancellations and no-shows
- Table turnover
- Covers served (total seated guests)

Reports use automatically captured creation, seating, status-change, and table-availability timestamps where applicable.

## 5. Primary workflows

### Add and seat a walk-in

1. A host signs in and creates a walk-in record.
2. The guest appears as **Waiting** on the active waitlist.
3. When ready, the host selects one or more tables on the map.
4. If selected capacity is too small, the app displays a warning and lets the host continue or choose different tables.
5. The host marks the guest **Seated**.
6. The app timestamps the action and marks all assigned tables **Occupied**.
7. A server later marks each table **Available** when it is ready again.

### Create and honor a reservation

1. A host creates a reservation with guest details, date, time, and table assignment as needed.
2. The app warns about overlapping bookings on the same table.
3. The table map shows an upcoming assigned table as **Reserved**.
4. At service time, the host assigns/confirm tables and marks the party **Seated**.
5. The table becomes **Occupied** until a server or manager marks it **Available**.

## 6. Screens

### Sign in

- Individual staff sign-in.

### Host dashboard

- Active waitlist
- Reservation list for the relevant date/service period
- Search by name or phone number
- Add walk-in and add-reservation actions
- Visual table map with manual single-table and multi-table selection
- Status and capacity warnings

### Server dashboard

- Assigned/occupied table view
- Party details and special requests
- Action to mark a table available

### Manager dashboard

- All host and server operational views
- Table management
- Staff account and role management
- Daily reporting

## 7. Data model (logical)

### StaffAccount

- id
- name
- login credentials (stored securely)
- role: host, server, or manager
- active flag
- created timestamp

### GuestEntry

- id
- entry type: walk-in or reservation
- party name
- party size
- phone number
- special request
- estimated arrival time
- estimated wait time (walk-ins)
- reservation date and time (reservations)
- status: waiting, seated, cancelled, or no-show
- created timestamp
- timestamps for seated, cancelled, and no-show as applicable
- created-by staff account

### RestaurantTable

- id
- table identifier/label
- seating capacity
- availability state: available, occupied, or reserved
- active flag

### TableAssignment

- id
- guest entry
- restaurant table
- assignment type: reservation or seating
- assigned timestamp
- released/available timestamp when applicable

This relationship permits a guest entry to use one or more tables.

## 8. Validation and business rules

- Required guest fields: party name, party size, phone number, special request, and estimated arrival time.
- A reservation also requires a valid reservation date and time.
- Party size must be a positive whole number.
- A table must have a unique identifier and a positive seating capacity.
- Only a host or manager may assign tables or change guest status.
- Only a server or manager may mark a table available after occupancy.
- Guests cannot be seated without at least one assigned table.
- A capacity mismatch and reservation overlap are warnings. They require the staff member to make an intentional decision but are not hard blocks.
- Guest details are immutable after creation; cancellation/no-show preserves the original record.

## 9. Non-functional requirements

- The UI must work on desktop and tablet browsers.
- The host dashboard and table map must remain usable during an active service period without horizontal overflow on common tablet screens.
- The application must protect sign-in credentials and restrict data/actions by role.
- Operational changes must save reliably and make updated table and guest status visible to other signed-in staff.
- Dates and times should use the restaurant's local time zone.

## 10. Out of scope for the first version

- Customer self-service waitlist or reservation booking
- SMS, email, or in-app guest notifications
- Automatic table recommendations
- Multiple restaurant locations
- Editing guest details after creation
- Payment, point-of-sale, or kitchen integrations

## 11. Acceptance criteria

The MVP is complete when:

1. Each host, server, and manager can sign in with an individual account and only see permitted actions.
2. A host can create a walk-in, see it as waiting, select one or more map tables, receive a capacity warning when appropriate, and seat the party.
3. Seating marks every assigned table occupied; a server can later make it available.
4. A host can create a reservation and receives an overlap warning for a conflicting same-table booking.
5. The table map accurately displays available, occupied, and reserved states.
6. Staff can search waitlist entries and reservations by party name or phone number.
7. Guest details cannot be edited after creation, while allowed status changes remain available and timestamped.
8. Managers can manage staff/table records and view daily wait-time, cancellation/no-show, turnover, and covers-served reports.
