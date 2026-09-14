# HostBoard development process

## Source of truth

`_docs/specs.md` is the product source of truth. A change to user roles, workflow, data, validation, or scope starts there before implementation changes are made.

## Project structure

- `_docs/` contains product and process documentation.
- `frontent/` contains the browser frontend prototype. The spelling matches the homework requirement.
- `frontent/api.js` is the only frontend module allowed to make backend-facing calls. It currently uses an in-memory mock implementation.
- Future backend code and tests will be added outside `frontent/`.

## Roles

- PM - grooms a task before anyone implements it, follows _docs/team/pm.md
- Engineer - implements one groomed task, follows _docs/team/software-engineer.md
- QA - checks the result against the acceptance criteria, follows _docs/team/qa-engineer.md

## Local issue tracking

This repository contains multiple projects, so HostBoard does not use GitHub
Issues. `_docs/tasks.md` is the numbered backlog, and
`_docs/github-issues.md` contains the groomed local issue records and their
implementation or QA notes. A task is ready for implementation only when its
matching local issue record has all four sections from `_docs/task-template.md`.
When scope moves to another task, link to that task in `_docs/tasks.md`.
PM work proceeds one local issue at a time: finish and validate one groomed
record before beginning the next one.

## Delivery sequence

1. Define or revise the product specification.
2. Read the acceptance criteria before starting and before closing
2. Build and validate the interactive frontend against that specification using mocked data.
3. Define an OpenAPI contract from the frontend boundary in `frontent/api.js`.
4. Write FastAPI endpoint tests before implementing the mock-database backend.
5. Connect `frontent/api.js` to the backend without moving request logic into UI components.
6. Replace the backend mock store with a SQLAlchemy-backed database while keeping the API contract stable.

## Working rules

- Keep role permissions enforced in both the UI and the eventual backend.
- Preserve the immutable guest-detail rule after an entry is created; only permitted operational status/table actions may change.
- Keep mocked API behavior asynchronous and centralized, so swapping to real HTTP requests affects one module.
- Frontend-only tasks must use the centralized mock API boundary and must not require a running backend. Backend integration is a separate task after the relevant API is available.
- Add dependencies only after approval and record the command needed to run or test the affected component.
- Run the relevant checks before committing. For frontend work, check JavaScript syntax and verify the rendered interface at desktop and tablet/mobile widths. For backend work, run the test suite with `uv run pytest`.


## Current stage

The project is at the interactive frontend-prototype stage. It has no backend, database, authentication service, or external messaging integration yet.
