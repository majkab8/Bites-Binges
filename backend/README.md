# Backend

Django + Django REST Framework API for Board & Screen Hub.

## Setup
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

## Run
```powershell
python manage.py runserver
```

- Admin panel: http://localhost:8000/admin (log in with email)
- API docs: http://localhost:8000/api/docs/

## Environment variables
| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | `dev-only-insecure-key` | Secret key, **must be set outside local dev** |
| `DJANGO_DEBUG` | `1` | `1` = debug on, `0` = off |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated list of hosts |

## Tests
```powershell
pytest
```

## After pulling changes
```powershell
pip install -r requirements.txt
python manage.py migrate
```