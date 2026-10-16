# Backend

Django + Django REST Framework API for Board & Screen Hub.

## Requirements
- [uv](https://docs.astral.sh/uv/getting-started/installation/) - it installs the pinned Python version (3.13) automatically

## Setup
```powershell
cd backend
uv sync
copy .env.example .env
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

## Run
```powershell
uv run python manage.py runserver
```

- Admin panel: http://localhost:8000/admin (log in with email)
- API docs: http://localhost:8000/api/docs/

## Environment variables
| Variable | Default                 | Description |
|---|-------------------------|---|
| `DJANGO_SECRET_KEY` | `dev-only-insecure-key` | Secret key, **must be set outside local dev** |
| `DJANGO_DEBUG` | `0`                     | `1` = debug on, `0` = off |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1`   | Comma-separated list of hosts |

## Tests
```powershell
uv run pytest
```

## After pulling changes
```powershell
uv sync
uv run python manage.py migrate
```

## Adding dependencies
App libraries:
```powershell
uv add <package>
```
Dev-only libraries (tests, linters):
```powershell
uv add --dev <package>
```

## Lint & format
```powershell
uv run ruff check --fix .
uv run ruff format .
```
Commit both `pyproject.toml` and `uv.lock`. Do not edit `uv.lock` manually.