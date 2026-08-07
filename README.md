# Cognitive learning platform

Research prototype for media literacy and cognitive resilience: citizens take assessments, get adaptive content, and managers see engagement analytics.

**Stack:** React (Vite) + Django REST + JWT. SQLite locally; Postgres via env when you need it.

## Roles

| In the UI | In the code |
|-----------|-------------|
| Citizen | `student` |
| Domain expert | `teacher` |
| Manager | `admin` |

## Run locally

### Backend

```bash
cd coglearning
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # or cp on macOS/Linux
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API base: `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd cognitive-frontend
npm install
# optional: copy .env.example → .env (defaults to the API above)
npm run dev
```

### Useful extras

```bash
# role workflow smoke test
python scripts/e2e_role_workflows.py

# train live churn model (writes joblib under ml_engine/artifacts/)
cd coglearning && python manage.py train_churn_model

# offline abandonment training
python scripts/train_abandonment_model.py
```

## Layout

```
coglearning/           Django API
cognitive-frontend/    React app
silver_project/        Algorithm test suite (academic)
scripts/               E2E + offline ML training
models/                Offline abandonment artifact
thesis/                Persian thesis chapters
docs/ARCHITECTURE.md   Short system map
archive/               Old audit reports (not maintained)
```

## Docs

- [Architecture](docs/ARCHITECTURE.md) — apps, request flow, ML tracks
- [Thesis](thesis/README.md) — academic write-up (Persian)

Endpoint details live in the Django apps under `coglearning/*/urls.py`. Older API tables and audit reports are in [`archive/`](archive/README.md).
