#!/usr/bin/env python3
"""
Simple service checker for backend & frontend.
Usage:
  python tools/check_services.py --config tools/services.example.json
Environment for optional login:
  CHECK_LOGIN_URL, CHECK_USERNAME, CHECK_PASSWORD
"""
import sys
import json
import argparse
import os
from urllib import request, parse, error

def http_request(url, method='GET', headers=None, data=None, timeout=10):
    headers = headers or {}
    data_bytes = None
    if data is not None:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = request.Request(url, data=data_bytes, headers=headers, method=method.upper())
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            content = resp.read()
            ct = resp.getheader('Content-Type', '')
            body = None
            if 'application/json' in ct:
                try:
                    body = json.loads(content.decode('utf-8'))
                except Exception:
                    body = content.decode('utf-8', errors='replace')
            else:
                body = content.decode('utf-8', errors='replace')
            return resp.getcode(), body
    except error.HTTPError as e:
        return e.code, e.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None, str(e)

def perform_login(login_url, username, password):
    if not (login_url and username and password):
        return None
    status, body = http_request(login_url, method='POST', data={'username': username, 'password': password})
    if status is None:
        print(f"[LOGIN] failed: {body}")
        return None
    # Try common token shapes
    if isinstance(body, dict):
        token = body.get('access') or body.get('token') or body.get('access_token')
        if token:
            return token
    # fallback: no token found
    print(f"[LOGIN] status {status}, response: {body}")
    return None

def check_service(base, endpoints, token=None):
    ok = True
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    for e in endpoints:
        method = e.get('method', 'GET').upper()
        path = e.get('path', '/')
        url = base.rstrip('/') + '/' + path.lstrip('/')
        expected = e.get('expected_status', 200)
        key_check = e.get('contains_key')
        status, body = http_request(url, method=method, headers=headers)
        if status != expected:
            print(f"[FAIL] {method} {url} -> expected {expected}, got {status} ({body})")
            ok = False
            continue
        if key_check and isinstance(body, dict):
            if key_check not in body:
                print(f"[FAIL] {method} {url} -> missing key '{key_check}' in JSON response")
                ok = False
                continue
        print(f"[OK] {method} {url} -> {status}")
    return ok

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--config', default='tools/services.example.json', help='Path to services config json')
    args = p.parse_args()
    if not os.path.exists(args.config):
        print(f"Config not found: {args.config}")
        sys.exit(2)
    with open(args.config, 'r', encoding='utf-8') as f:
        cfg = json.load(f)

    login_url = os.environ.get('CHECK_LOGIN_URL') or cfg.get('login', {}).get('url')
    username = os.environ.get('CHECK_USERNAME') or cfg.get('login', {}).get('username')
    password = os.environ.get('CHECK_PASSWORD') or cfg.get('login', {}).get('password')

    token = None
    if login_url and username and password:
        print("[INFO] attempting login to obtain token...")
        token = perform_login(login_url, username, password)
        if token:
            print("[INFO] obtained token")

    overall_ok = True
    for svc in cfg.get('services', []):
        name = svc.get('name', 'service')
        base = svc.get('base')
        endpoints = svc.get('endpoints', [])
        if not base:
            print(f"[WARN] service {name} has no base url, skipping")
            continue
        print(f"[INFO] checking service '{name}' at {base} ...")
        svc_ok = check_service(base, endpoints, token if svc.get('requires_auth') else None)
        overall_ok = overall_ok and svc_ok

    if not overall_ok:
        print("[RESULT] Some checks failed")
        sys.exit(1)
    print("[RESULT] All checks passed")
    sys.exit(0)

if __name__ == '__main__':
    main()
