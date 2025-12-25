# flake8: noqa
import os
import sys

# Make sure project root is on path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cog_learning.settings')

import django
django.setup()

from rest_framework.test import APIClient  # noqa: E402

client = APIClient()

endpoints = [
    '/api/assessment/tests/',
    '/api/assessment/tests/placement/',
    '/api/assessment/sessions/',
    '/api/learning/recommended/',
    '/api/analytics/overview/',
    '/api/analytics/alerts/',
    '/api/accounts/health/',
]

print('Running smoke tests (unauthenticated requests)')
for ep in endpoints:
    resp = client.get(ep)
    print(f'{ep} -> {resp.status_code}')
    # print body for unexpected statuses
    if resp.status_code not in (200, 401, 403, 404):
        print('Body:', resp.data)

print('Smoke tests completed')
