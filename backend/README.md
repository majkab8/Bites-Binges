# Backend

Django + Django REST Framework API for Board & Screen Hub.

## Requirements

- [uv](https://docs.astral.sh/uv/getting-started/installation/) - it installs the pinned Python version (3.13) automatically
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the PostgreSQL database

## Setup

```powershell
docker compose up -d
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

## Auth API

Session-based auth under `/api/auth/`. All request and response bodies are JSON.

| Method | Endpoint                     | Access    | Description                                                                                                      |
|--------|------------------------------| --------- |------------------------------------------------------------------------------------------------------------------|
| `GET`  | `/api/auth/csrf/`            | Public    | Sets the `csrftoken` cookie (`204`)                                                                              |
| `POST` | `/api/auth/register/`        | Public    | `email`, `username`, `password`, optional `display_name`. Creates the user and logs them in (`201`)              |
| `POST` | `/api/auth/login/`           | Public    | `email`, `password`. Logs the user in (`200`)                                                                    |
| `POST` | `/api/auth/logout/`          | Public    | Ends the session (`204`)                                                                                         |
| `GET`  | `/api/auth/me/`              | Logged in | Current user (`200`), or `403` when not logged in                                                                |
| `POST` | `/api/auth/password/change/` | Logged in | `current_password`, `new_password`. Changes the password, keeps this session and logs out other sessions (`204`) |

`register`, `login` and `me` return the user as `{id, email, username, display_name, color}`. Validation errors return `400` with messages per field.

Email and username are unique regardless of letter case. `register`, `login` and `password/change` are limited to 10 requests per minute per client (`429` after that).

### CSRF

Every `POST` needs the `X-CSRFToken` header with the value of the `csrftoken` cookie:

1. Call `GET /api/auth/csrf/` once before the first `POST` to get the cookie.
2. Read the cookie **before each request**. Django changes the token on login and register, so a token saved earlier stops working.

A missing or outdated token returns `403`. In Swagger, reload the page after logging in, because it keeps the token from page load.

## Environment variables

| Variable                      | Default                                       | Description                                                                    |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `DJANGO_SECRET_KEY`           | `dev-only-insecure-key`                       | Secret key, **must be set outside local dev**                                  |
| `DJANGO_DEBUG`                | `0`                                           | `1` = debug on, `0` = off                                                      |
| `DJANGO_ALLOWED_HOSTS`        | `localhost,127.0.0.1`                         | Comma-separated list of hosts                                                  |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated origins allowed to send `POST` requests (the frontend address) |

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

## Database

PostgreSQL runs in Docker. Run these commands from the **repo root** (where `docker-compose.yml` is):

| Command                  | What it does                              |
| ------------------------ | ----------------------------------------- |
| `docker compose up -d`   | Start the database                        |
| `docker compose ps`      | Check status (should be `healthy`)        |
| `docker compose down`    | Stop the database, data is kept           |
| `docker compose down -v` | Stop the database and **delete all data** |
