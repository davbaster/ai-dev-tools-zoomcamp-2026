# HostBoard

HostBoard is a restaurant front-of-house waitlist manager for a single location. It gives hosts, servers, and managers one place to coordinate walk-ins, reservations, table availability, and service reporting.

## What users can do

- Hosts add walk-ins and reservations, select one or more tables from the floor map, and seat, cancel, or mark parties as no-shows.
- Servers see their occupied tables and mark a table available when it is ready for the next party.
- Managers also manage staff accounts and tables, and can view a daily service report.

The current version is a frontend prototype with realistic mocked data. No real accounts, database, or guest notifications are connected yet.

## Start the prototype

From `02-development`, start a static web server for the project root:

```powershell
npx --yes serve .
```

Open the printed local URL with `/frontend/` appended, for example
`http://localhost:3000/frontend/`. The interface starts in the host view.

The `frontend/` folder is the application entry point. It uses the local,
asynchronous mock API, so no FastAPI server, database, or staff account is
needed to try the prototype. Use the profile control at the bottom of the
sidebar to preview the server and manager views.

## Main flow to try

1. Select a waiting party from the right-hand queue or the Waitlist page.
2. Select one or more available tables on the dining-room map.
3. Review any capacity warning, assign the tables, and seat the party.
4. Switch to a server account and use **Ready** to return an occupied table to availability.
5. Switch to a manager account to view reports and manage staff or tables.

## Documentation

- [Product specification](_docs/specs.md)
- [Development process](_docs/process.md)
