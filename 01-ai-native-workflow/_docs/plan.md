# Shared Household Chores MVP Plan

## Product goal

Build a responsive web app for one household of approximately 2-8 people. The
primary goal is accountability: an assigned person marks a chore complete, and
a designated verifier confirms it.

## MVP features

1. **Household membership and roles**
   - Members join with a persistent household code and a chosen, unique name.
   - A household can have multiple admins.
   - Admins manage members, invitations, and admin rights.
   - Members can leave; admins can remove members while preserving their history.

2. **Chore planning and assignment**
   - Support one-time and recurring chores.
   - Each chore has a title, exact due time, assignee, verifier, and optional
     instructions or image attachments.
   - Recurring chores support specific weekdays or dates, automatic next
     occurrences, an end date or occurrence limit, skipping an occurrence, and
     changing future assignees.
   - Admins create, edit, archive, assign, and reassign chores.
   - Members may propose chores; admins approve, reject, or edit proposals.

3. **Completion and verification**
   - The assignee marks a chore complete.
   - A designated verifier confirms it; the verifier cannot be the assignee.
   - Rejection returns the chore to open and requires a comment.
   - Admins may override, reopen, confirm, or cancel a chore.
   - Admins choose per chore whether a completion photo is required. Assignees
     upload the photo when marking the chore complete.

4. **Reminders, escalation, and history**
   - Show open, pending confirmation, completed, skipped, and overdue states.
   - Send in-app reminders at a configurable time before the due time.
   - Escalate an overdue chore to admins once when it becomes overdue.
   - All members can browse full history, including status changes, timestamps,
     people involved, and rejection comments.

## Main experience

The home screen is a household status board, with today's timeline available
alongside it. Members can see all household chores and filter by status or
person. There is no calendar view in the MVP.

## Explicit non-goals

- Multiple households per person; this may be added later.
- Email authentication or email notifications.
- Rewards, points, streaks, or achievements.
- Automatic chore rotation or member-claimed chores.
- Public household discovery.
- Non-image attachments.
- Required completion evidence for every chore.

The shared-code sign-in is intentionally simple for the MVP and provides less
identity protection than personal accounts. Unique member names are required
within each household.

## Implementation plan

1. Create the Django project and chores app; configure the development database.
2. Implement household, member, role, invitation-code, and membership flows.
3. Implement chores, recurring schedules, occurrences, assignments, verifiers,
   proposals, archives, and image attachments.
4. Implement the completion workflow and audit history, including verification,
   rejection comments, proof photos, skips, and admin overrides.
5. Implement in-app reminders and one-time overdue escalation.
6. Build the responsive status board, today's timeline, chore forms, proposal
   review, and history views.
7. Add tests for permissions, recurrence, assignment, verification, reminders,
   escalation, attachments, and preserved history.
8. Run the test suite, verify the main flows in the browser, and document how to
   start the Django development server.

## Initial success criteria

- A household can be created and joined with its code.
- An admin can approve a proposed chore and assign both an assignee and verifier.
- A recurring chore creates its next occurrence automatically.
- A required-proof chore cannot be confirmed without an assignee photo.
- Rejected completions return to open with a visible reason.
- Overdue chores escalate once to admins.
- Members can inspect an accurate, preserved audit history.
