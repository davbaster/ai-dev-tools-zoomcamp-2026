# Household Chores

## Current authentication status.

At this stage of the implementation, only Django admin users and superusers
can log in through the admin site. Normal household-member login and joining
are not implemented yet; they are planned in `_docs/backlog.md`, task 2.

## Access the Django admin

From the `app` directory, create an administrator account and start the
development server:

```bash
cd app
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

Then open <http://127.0.0.1:8000/admin/> and log in with the superuser
credentials.

## Documentation

The `_docs` folder contains the project's planning documents:

- `plan.md` describes the product goal, MVP scope, workflows, and success
  criteria.
- `backlog.md` contains the ordered Django implementation tasks and their
  completion criteria.
