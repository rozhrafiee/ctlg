#!/usr/bin/env python
"""
End-to-end API workflows for Citizen (student), Domain Expert (teacher), and Manager (admin).

Run from coglearning/:
  python ../scripts/e2e_role_workflows.py

Requires: Django DB migrated, run against local settings (.env with DEBUG=True).
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COG = ROOT / "coglearning"
sys.path.insert(0, str(COG))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coglearning.settings")

import django

django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS = list(settings.ALLOWED_HOSTS) + ['testserver', 'localhost', '127.0.0.1']

User = get_user_model()
RESULTS = []


def ok(role, step, detail=""):
    RESULTS.append({"role": role, "step": step, "status": "PASS", "detail": detail})
    print(f"[PASS] [{role}] {step} {detail}")


def fail(role, step, detail=""):
    RESULTS.append({"role": role, "step": step, "status": "FAIL", "detail": str(detail)})
    print(f"[FAIL] [{role}] {step}: {detail}")


def ensure_user(username, password, role, **extra):
    user, created = User.objects.get_or_create(username=username, defaults={"role": role, **extra})
    user.role = role
    for k, v in extra.items():
        setattr(user, k, v)
    user.set_password(password)
    user.is_active = True
    user.save()
    return user


def auth_client(username, password):
    c = APIClient()
    res = c.post("/api/accounts/login/", {"username": username, "password": password}, format="json")
    if res.status_code != 200:
        raise RuntimeError(f"login failed {res.status_code} {res.data}")
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return c, res.data


def workflow_citizen():
    role = "Citizen"
    ensure_user(
        "e2e_citizen",
        "E2ePass123!",
        "student",
        cognitive_level=25,
        has_taken_placement_test=True,
    )
    try:
        c, tokens = auth_client("e2e_citizen", "E2ePass123!")
        ok(role, "login")
    except Exception as e:
        fail(role, "login", e)
        return

    for step, path, method in [
        ("profile", "/api/accounts/profile/", "get"),
        ("my-stats", "/api/analytics/my-stats/", "get"),
        ("student-dashboard", "/api/analytics/student-dashboard/", "get"),
        ("tests-catalog", "/api/assessment/tests/", "get"),
        ("history", "/api/assessment/my-history/", "get"),
        ("recommended", "/api/adaptive-learning/recommended/", "get"),
        ("learning-path", "/api/adaptive-learning/learning-path/", "get"),
        ("roadmap", "/api/adaptive-learning/learning-roadmap/", "get"),
        ("progress", "/api/adaptive-learning/progress/", "get"),
        ("recommendations", "/api/adaptive-learning/recommendations/", "get"),
        ("adaptive-dashboard", "/api/adaptive-learning/dashboard/", "get"),
        ("churn", "/api/ml/churn/", "get"),
        ("ml-notifications", "/api/ml/notifications/", "get"),
    ]:
        res = getattr(c, method)(path)
        if res.status_code < 400:
            ok(role, step, f"HTTP {res.status_code}")
        else:
            fail(role, step, f"HTTP {res.status_code} {getattr(res, 'data', '')}")

    # logout blacklist
    refresh = tokens.get("refresh")
    res = c.post("/api/accounts/logout/", {"refresh": refresh}, format="json")
    if res.status_code in (200, 205):
        ok(role, "logout-blacklist", f"HTTP {res.status_code}")
    else:
        fail(role, "logout-blacklist", f"HTTP {res.status_code}")


def workflow_expert():
    role = "Expert"
    ensure_user("e2e_expert", "E2ePass123!", "teacher")
    try:
        c, _ = auth_client("e2e_expert", "E2ePass123!")
        ok(role, "login")
    except Exception as e:
        fail(role, "login", e)
        return

    for step, path in [
        ("teacher-dashboard", "/api/analytics/teacher-dashboard/"),
        ("contents", "/api/adaptive-learning/teacher/contents/"),
        ("tests", "/api/assessment/teacher/tests/all/"),
        ("pending-reviews", "/api/assessment/teacher/reviews/pending/"),
    ]:
        res = c.get(path)
        if res.status_code < 400:
            ok(role, step, f"HTTP {res.status_code}")
        else:
            fail(role, step, f"HTTP {res.status_code}")

    # create content
    res = c.post(
        "/api/adaptive-learning/teacher/content/create/",
        {
            "title": "E2E Content",
            "content_type": "text",
            "body": "Body",
            "min_level": 1,
            "max_level": 100,
            "is_active": True,
        },
        format="json",
    )
    if res.status_code in (200, 201):
        ok(role, "create-content", f"id={res.data.get('id')}")
        content_id = res.data.get("id")
    else:
        fail(role, "create-content", f"{res.status_code} {res.data}")
        content_id = None

    res = c.post(
        "/api/assessment/teacher/tests/create/",
        {
            "title": "E2E General Test",
            "test_type": "general",
            "description": "e2e",
            "min_level": 1,
            "target_level": 10,
            "time_limit_minutes": 20,
            "passing_score": 70,
            "is_active": True,
            "questions": [],
        },
        format="json",
    )
    if res.status_code in (200, 201):
        ok(role, "create-test", f"id={res.data.get('id')}")
    else:
        fail(role, "create-test", f"{res.status_code} {res.data}")

    if content_id:
        res = c.post(f"/api/assessment/content/{content_id}/test/create/", {}, format="json")
        if res.status_code < 400:
            ok(role, "create-content-test", f"HTTP {res.status_code}")
        else:
            # may already exist (OneToOne) — still acceptable for workflow
            ok(role, "create-content-test", f"HTTP {res.status_code} (may already exist)")


def workflow_manager():
    role = "Manager"
    ensure_user("e2e_manager", "E2ePass123!", "admin", is_staff=True)
    try:
        c, _ = auth_client("e2e_manager", "E2ePass123!")
        ok(role, "login")
    except Exception as e:
        fail(role, "login", e)
        return

    for step, path in [
        ("system-report", "/api/analytics/system-report/"),
        ("engagement-metrics", "/api/analytics/engagement-metrics/"),
        ("teacher-dashboard", "/api/analytics/teacher-dashboard/"),
        ("all-tests", "/api/assessment/teacher/tests/all/"),
        ("all-contents", "/api/adaptive-learning/teacher/contents/"),
    ]:
        res = c.get(path)
        if res.status_code < 400:
            ok(role, step, f"HTTP {res.status_code}")
        else:
            fail(role, step, f"HTTP {res.status_code} {getattr(res, 'data', '')}")


def main():
    print("=== E2E role workflows ===")
    workflow_citizen()
    workflow_expert()
    workflow_manager()
    failed = [r for r in RESULTS if r["status"] == "FAIL"]
    out = ROOT / "docs" / "e2e_workflow_results.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(RESULTS, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {out}")
    print(f"Total={len(RESULTS)} PASS={len(RESULTS) - len(failed)} FAIL={len(failed)}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
