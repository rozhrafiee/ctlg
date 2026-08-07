# Test Report

Generated as part of the full-stack audit close-out.

## Django DRF tests

Command (from `coglearning/`):

```bash
python manage.py test accounts.tests assessment.tests ml_engine.tests adaptive_learning.tests analytics.tests
```

**Result:** 23 tests — **OK** (includes logout blacklist, ownership, ML churn, analytics admin gate, catalog meta).

## Silver Project

Command (from `silver_project/`):

```bash
python -m pytest -q
```

**Result:** **376 passed** (coverage + mutation-killing suites).

## End-to-end role workflows (API)

Command:

```bash
cd coglearning
python ../scripts/e2e_role_workflows.py
```

**Result:** **29/29 PASS** (see `docs/e2e_workflow_results.json`).

| Role | Covered |
|------|---------|
| Citizen | login, profile, stats, dashboards, catalog, adaptive, churn, notifications, logout blacklist |
| Expert | dashboards, content CRUD create, test create, content-linked test |
| Manager | system report, engagement metrics, global teacher views |

## Frontend build

```bash
cd cognitive-frontend && npm run build
```

**Result:** success with lazy routes + vendor/charts chunks.

## Gaps / not automated

- Full browser UI click-through (manual / Playwright not in repo)
- PostgreSQL CI matrix (SQLite used in local/CI-like runs)
- Load / soak testing
