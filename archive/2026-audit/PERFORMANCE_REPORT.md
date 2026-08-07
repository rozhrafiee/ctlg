# Performance Report

## Backend

| Area | Change |
|------|--------|
| Assessment list | `select_related('created_by', 'related_content')` |
| Pending reviews / session detail | `select_related('user', 'test')` |
| Engagement metrics | `select_related('user')` on summaries |
| Related tests on content | Prefer `related_content_id` / reverse OneToOne safely |

### Remaining opportunities

- Prefetch questions/choices on test detail for large exams
- Cache churn feature vectors briefly per user if traffic grows
- Engagement metrics loop calls `evaluate_abandonment` per row — fine for research scale; batch for thousands of citizens

## Frontend

| Area | Change |
|------|--------|
| Route code-splitting | `React.lazy` + `Suspense` in `App.jsx` |
| Vendor chunks | `manualChunks`: `vendor` (react/router), `charts` (recharts) |
| Sourcemaps | Disabled in production Vite build |

### Build note

Production build emits multiple chunks (app + vendor + charts) instead of a single >500KB monolith.

## Database

- Default local: SQLite
- Production: set `POSTGRES_DB` or `DATABASE_URL`
- Indexes: rely on PK/FK; add composite indexes on `(user, status)` for `TestSession` if needed under load

## ML inference

- Lazy-loaded joblib model (process memory cache)
- Heuristic fallback if artifact missing (tests / cold start)
