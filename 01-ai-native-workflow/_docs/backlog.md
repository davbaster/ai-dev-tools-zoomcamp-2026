# Shared Household Chores Backlog.

Tasks are ordered by dependency and sized to be implemented one at a time.

## Task 1: Create household and member models

Implement the foundation for one household with members and shared admins.

- Add `Household` and `Member` models.
- Generate a persistent household access code.
- Require member names to be unique within a household.
- Support multiple admins and preserve removed members for history.
- Create and run migrations.

Done when a household and its members can be created in the Django admin and
the model constraints are covered by tests.

## Task 2: Add household joining and membership flows

Implement the simple MVP access model.

- Create a household and become its first admin.
- Join with a persistent household code and chosen name.
- Allow members to leave and admins to remove members.
- Allow admins to promote or demote other admins.
- Enforce household membership on all household data.

Done when a member can join, leave, and be removed, and unauthorized users
cannot access the household.

## Task 3: Create chore and occurrence models

Model one-time and recurring chores.

- Add title, instructions, due date/time, assignee, verifier, and status.
- Add recurring schedules for specific weekdays or dates.
- Add optional end date or occurrence limit.
- Add image attachments and a per-chore proof-required setting.
- Add proposals and archived chores.

Done when migrations support the fields and constraints required by the plan.

## Task 4: Build chore proposals and admin management

Implement how chores enter and are managed in the household.

- Let members propose chores.
- Let admins approve, reject, or edit proposals.
- Let admins create, edit, archive, assign, and reassign chores.
- Let admins set the verifier and proof requirement.
- Let admins skip an occurrence.

Done when the complete proposal and management flow works through Django views
and forms.

## Task 5: Implement completion and verification

Implement the accountability workflow.

- Let only the assignee mark an occurrence complete.
- Require a completion image when proof is enabled.
- Let only the designated verifier confirm it.
- Return rejected completions to open and require a rejection comment.
- Let admins reopen, confirm, or cancel occurrences.

Done when invalid role/status transitions are rejected and valid transitions
are recorded.

## Task 6: Generate recurring occurrences and future assignments

Automate recurring chore behavior.

- Generate the next occurrence after completion or according to its schedule.
- Stop at the configured end date or occurrence limit.
- Keep skipped occurrences in history.
- Allow admins to change assignees for future occurrences only.

Done when recurring schedules produce the expected occurrences without creating
duplicates.

## Task 7: Build the status board, timeline, and history

Create the main responsive member experience.

- Show the household status board first.
- Include today's timeline and filters by status or person.
- Show open, pending confirmation, completed, skipped, and overdue states.
- Let all members browse the full audit history.
- Preserve names and history after a member is removed.

Done when members can see the current household workload and understand every
status change.

## Task 8: Add reminders and overdue escalation

Implement the planned in-app notifications.

- Allow a configurable pre-due reminder per chore.
- Mark occurrences overdue after their exact due time.
- Notify admins once when an occurrence becomes overdue.
- Avoid duplicate reminders and escalation events.

Done when reminder and escalation behavior is covered by tests and visible in
the application.

## Task 9: Test and document the MVP

Finish the first usable version.

- Add tests for permissions, recurrence, proposals, verification, proof photos,
  reminders, escalation, and preserved history.
- Run the full Django test suite and system checks.
- Verify the main flows in a browser at responsive widths.
- Document setup and the development-server command.

Done when the test suite passes and a new developer can run the app from the
repository instructions.
