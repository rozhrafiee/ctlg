#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const pkgPath = path.join(frontendDir, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('frontend/package.json not found — please run this from the repo root or create frontend/package.json first.');
  process.exit(2);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
let modified = false;

pkg.scripts = pkg.scripts || {};

// Add sensible dev/build scripts based on detected tool
if (deps['vite']) {
  if (!pkg.scripts.dev) { pkg.scripts.dev = 'vite'; modified = true; }
  if (!pkg.scripts.build) { pkg.scripts.build = 'vite build'; modified = true; }
  if (!pkg.scripts.preview) { pkg.scripts.preview = 'vite preview --port 5173'; modified = true; }
} else if (deps['react-scripts']) {
  if (!pkg.scripts.start) { pkg.scripts.start = 'react-scripts start'; modified = true; }
  if (!pkg.scripts.build) { pkg.scripts.build = 'react-scripts build'; modified = true; }
  if (!pkg.scripts.preview) { pkg.scripts.preview = 'serve -s build -l 5173'; modified = true; }
} else if (deps['next']) {
  if (!pkg.scripts.dev) { pkg.scripts.dev = 'next dev'; modified = true; }
  if (!pkg.scripts.build) { pkg.scripts.build = 'next build'; modified = true; }
  if (!pkg.scripts.preview) { pkg.scripts.preview = 'next start'; modified = true; }
}

// Add lint/test defaults (non-destructive)
if (!pkg.scripts.lint) { pkg.scripts.lint = 'eslint src --ext .js,.jsx,.ts,.tsx'; modified = true; }

// Replace the generic "no tests" placeholder with a jest runner if not present
if (!pkg.scripts.test || pkg.scripts.test.includes('no tests')) {
  // prefer jest if project has TypeScript (or leave as a simple command)
  pkg.scripts.test = 'jest --passWithNoTests';
  modified = true;
}

if (modified) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('Updated frontend/package.json with missing scripts.');
} else {
  console.log('No changes needed in frontend/package.json scripts.');
}

// Ensure .env.example has VITE_API_URL
const envExamplePath = path.join(frontendDir, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, 'VITE_API_URL=http://127.0.0.1:8000\n', 'utf8');
  console.log('Created frontend/.env.example (VITE_API_URL=http://127.0.0.1:8000).');
} else {
  // if file exists but missing VITE_API_URL, append it
  const content = fs.readFileSync(envExamplePath, 'utf8');
  if (!/VITE_API_URL\s*=/.test(content)) {
    fs.appendFileSync(envExamplePath, '\nVITE_API_URL=http://127.0.0.1:8000\n', 'utf8');
    console.log('Appended VITE_API_URL to frontend/.env.example.');
  } else {
    console.log('frontend/.env.example already contains VITE_API_URL.');
  }
}

// Ensure basic ESLint config exists
const eslintrc = path.join(frontendDir, '.eslintrc.json');
if (!fs.existsSync(eslintrc)) {
  const cfg = {
    "env": { "browser": true, "es2021": true, "node": true },
    "extends": ["eslint:recommended"],
    "parserOptions": { "ecmaVersion": 12, "sourceType": "module" },
    "rules": { "no-unused-vars": "warn", "no-console": "off" }
  };
  fs.writeFileSync(eslintrc, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  console.log('Created frontend/.eslintrc.json (basic).');
} else {
  console.log('frontend/.eslintrc.json already exists.');
}

console.log('\nNext steps (locally):\n  cd frontend\n  npm ci\n  npm run lint\n  npm run build\n');
process.exit(0);
