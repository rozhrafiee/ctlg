#!/usr/bin/env node
/**
 * Simple smoke tester for backend & frontend endpoints.
 * Usage:
 *   node tools/smoke_all.js --config tools/services.example.json
 *
 * It supports optional login (config.login) to obtain a token which is used for services that require_auth.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

function request(url, opts = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const data = opts.body ? Buffer.from(JSON.stringify(opts.body), 'utf8') : null;
    const headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
    if (data) headers['Content-Type'] = 'application/json';
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + (u.search || ''),
        method: opts.method || 'GET',
        headers,
        timeout: opts.timeout || 10000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          let parsed = body;
          try { parsed = JSON.parse(body); } catch (e) {}
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', (e) => resolve({ status: null, body: String(e) }));
    if (data) req.write(data);
    req.end();
  });
}

async function doLogin(loginCfg) {
  if (!loginCfg || !loginCfg.url || !loginCfg.username || !loginCfg.password) return null;
  const resp = await request(loginCfg.url, { method: 'POST', body: { username: loginCfg.username, password: loginCfg.password } });
  if (resp.status && typeof resp.body === 'object') {
    return resp.body.access || resp.body.token || resp.body.access_token || null;
  }
  console.error('[LOGIN] failed', resp);
  return null;
}

async function checkEndpoint(base, e, token) {
  const method = (e.method || 'GET').toUpperCase();
  const path = e.path || '/';
  const url = base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await request(url, { method, headers });
  const ok = res.status === (e.expected_status || 200);
  if (!ok) {
    console.error(`[FAIL] ${method} ${url} -> expected ${e.expected_status||200}, got ${res.status} - ${JSON.stringify(res.body)}`);
    return false;
  }
  if (e.contains_key && typeof res.body === 'object') {
    if (!(e.contains_key in res.body)) {
      console.error(`[FAIL] ${method} ${url} -> missing key ${e.contains_key}`);
      return false;
    }
  }
  console.log(`[OK] ${method} ${url} -> ${res.status}`);
  return true;
}

async function main() {
  const cfgPath = process.argv[2] || (process.env.CONFIG || 'tools/services.example.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('Config not found:', cfgPath);
    process.exit(2);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const loginCfg = cfg.login || {};
  const token = await doLogin(loginCfg);
  if (loginCfg.url) console.log('[INFO] login attempted' + (token ? ' - token obtained' : ' - no token'));
  let overall = true;
  for (const svc of cfg.services || []) {
    const base = svc.base;
    if (!base) {
      console.warn('[WARN] service missing base', svc);
      continue;
    }
    console.log(`[INFO] checking service ${svc.name} at ${base}`);
    for (const e of svc.endpoints || []) {
      const ok = await checkEndpoint(base, e, token && svc.requires_auth ? token : null);
      overall = overall && ok;
    }
  }
  process.exit(overall ? 0 : 1);
}

main();
