# Security Report

## Configuration (production defaults)

| Setting | Production behavior |
|---------|---------------------|
| `DEBUG` | Defaults to **False** unless env sets True |
| `SECRET_KEY` | Required when `DEBUG=False` |
| `ALLOWED_HOSTS` | From env (includes `testserver` for API tests) |
| CORS | Allow-all **only** if `DEBUG=True`; else `CORS_ALLOWED_ORIGINS` |
| SSL redirect | `SECURE_SSL_REDIRECT` when not DEBUG (override via env) |
| Cookies | `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, HttpOnly when not DEBUG |
| HSTS | Enabled when not DEBUG |
| XSS / MIME / framing | `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS=DENY` |

Local development: `coglearning/.env` with `DEBUG=True` (gitignored pattern `.env`; use `.env.example`).

## Authentication

- JWT access (default 60m) + refresh (1d) via SimpleJWT
- `ROTATE_REFRESH_TOKENS` + `BLACKLIST_AFTER_ROTATION`
- App `rest_framework_simplejwt.token_blacklist` installed & migrated
- `POST /api/accounts/logout/` blacklists refresh token (HTTP 205)
- Frontend clears tokens after logout call

## Authorization

| Permission | Meaning |
|------------|---------|
| `IsStudent` | Citizen APIs (e.g. churn) |
| `IsTeacher` | teacher **or** admin |
| `IsAdminUser` | admin / superuser |
| `HasTakenPlacementTest` | Adaptive core student endpoints |

Public register cannot set `role=admin` (student/teacher only).

## Known residual risks (accepted for research prototype)

1. Access tokens live in `localStorage` (XSS surface) — mitigate with CSP in reverse proxy for prod.
2. Media served by Django when DEBUG; use object storage / nginx in production.
3. Abandonment offline model is not the live auth gate; live gate is inactivity rule + churn banner.

## Checklist before deploy

- [ ] Strong `SECRET_KEY`
- [ ] `DEBUG=False`
- [ ] Postgres credentials
- [ ] `CORS_ALLOWED_ORIGINS` = SPA origin(s)
- [ ] TLS termination + `SECURE_SSL_REDIRECT=True`
- [ ] Rotate any committed demo passwords
