# Final Audit Report

## Verdict

The repository is **audit-complete for deployment readiness and academic evaluation** under the agreed scope (full ML churn + aggressive cleanup + Postgres-via-env). Remaining items are operational (real secrets, TLS, Postgres provisioning), not missing product features for the three roles.

## What was completed in this close-out

1. Removed merge leftover gaps (wired Admin Engagement, placement create hook, my-stats on profile)
2. API ↔ frontend matrix with intentional aliases documented
3. Production security defaults (`DEBUG` default False, CORS lockdown, secure cookies/HSTS when not DEBUG)
4. JWT logout with refresh-token blacklist
5. Query `select_related` hardening + Vite lazy routes / manualChunks
6. E2E Citizen / Expert / Manager API workflows — **29/29 PASS**
7. Documentation pack under `docs/` (and root mirrors)

## Role mapping

Citizen=`student` · Domain Expert=`teacher` · Manager=`admin`

## ML (live)

- Features from behavioral DB fields → RandomForest `ml_engine/artifacts/churn_model.joblib`
- `GET /api/ml/churn/` → `{is_at_risk, probability, confidence}`
- Retention notifications + dismissible `RetentionBanner`

## Offline abandonment ML

Training script + joblib under `models/`; admin engagement UI uses the **30-day inactivity rule** at runtime (documented intentional separation).

## Document index

| File | Content |
|------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System structure |
| [API_MATRIX.md](API_MATRIX.md) | Endpoint ↔ UI coverage |
| [SECURITY_REPORT.md](SECURITY_REPORT.md) | Hardening & JWT |
| [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) | Query/bundle notes |
| [TEST_REPORT.md](TEST_REPORT.md) | Automated + E2E results |
| [e2e_workflow_results.json](e2e_workflow_results.json) | Raw E2E log |

## Deploy quickstart

```bash
# Backend
cd coglearning
cp .env.example .env   # set DEBUG=False, SECRET_KEY, Postgres, CORS
pip install -r requirements.txt
python manage.py migrate
python manage.py train_churn_model
python manage.py runserver   # or gunicorn

# Frontend
cd ../cognitive-frontend
npm ci && npm run build
# serve dist/ behind the same origin or configured CORS
```

## Intentional non-deletions

- `/api/assessment/results/<pk>/` — API alias
- `POST` on teacher contents list — alternate create
- `coglearning/algorithms` + `silver_project` — runtime vs academic suites
- Offline abandonment joblib — research artifact, not live churn path
