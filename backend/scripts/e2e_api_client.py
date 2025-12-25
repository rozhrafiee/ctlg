import requests
import time

BASE = 'http://127.0.0.1:8000'

s = requests.Session()
s.trust_env = False  # ignore environment proxy settings for local testing

# Health
print('Health ->', s.get(BASE + '/api/accounts/health/').status_code)

# Register a user
payload = {'username': 'e2e_stu', 'password': 'pass', 'role': 'student'}
resp = s.post(BASE + '/api/accounts/register/', json=payload)
print('Register ->', resp.status_code, resp.text)

# Obtain token
resp = s.post(BASE + '/api/accounts/token/', json={'username': 'e2e_stu', 'password': 'pass'})
print('Token ->', resp.status_code, resp.text)
if resp.status_code == 200:
    token = resp.json()['access']
    s.headers.update({'Authorization': f'Bearer {token}'})

    # Get placement test (should return 404 or the test if exists)
    resp = s.get(BASE + '/api/assessment/tests/placement/')
    print('Placement test ->', resp.status_code)

    # Create a test as teacher won't be allowed; test listing for student
    resp = s.get(BASE + '/api/assessment/tests/')
    print('Tests list ->', resp.status_code)

    # Create a simple test via admin API: create a user as admin? Skip; just check tests list

else:
    print('Login failed; skipping further checks')
