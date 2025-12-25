#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
CHECK_CFG="$ROOT/tools/services.example.json"
BACKEND_PID=""
FRONTEND_PID=""
LOGDIR="${TMPDIR:-/tmp}/ctlg-checks"
mkdir -p "$LOGDIR"

wait_for_url() {
  local url=$1
  local timeout=${2:-30}
  local start=$(date +%s)
  while true; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    if [ "$status" != "000" ]; then
      echo "[OK] $url -> $status"
      return 0
    fi
    now=$(date +%s)
    if [ $((now - start)) -ge "$timeout" ]; then
      echo "[TIMEOUT] waiting for $url"
      return 1
    fi
    sleep 1
  done
}

cleanup() {
  echo "Cleaning up..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Start backend
echo "Starting backend..."
pushd "$BACKEND_DIR" >/dev/null
python -m pip install --upgrade pip >/dev/null || true
# install deps if requirements exist
if [ -f requirements.txt ]; then python -m pip install -r requirements.txt >/dev/null || true; fi
python manage.py migrate --noinput
nohup python manage.py runserver 127.0.0.1:8000 >"$LOGDIR/backend.log" 2>&1 &
BACKEND_PID=$!
popd >/dev/null

# Wait for backend health endpoint
if ! wait_for_url "http://127.0.0.1:8000/api/health/" 30; then
  echo "Backend failed to start. See $LOGDIR/backend.log"
  exit 1
fi

# Build and serve frontend
echo "Preparing frontend..."
pushd "$FRONTEND_DIR" >/dev/null
node -v >/dev/null 2>&1 || { echo "Node is not installed"; exit 1; }
npm ci --silent
npm run build --if-present >/dev/null || true
# serve built site on port 5173 using npx serve
nohup npx serve -s dist -l 5173 >"$LOGDIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
popd >/dev/null

# Wait for frontend root
if ! wait_for_url "http://localhost:5173/" 30; then
  echo "Frontend failed to start. See $LOGDIR/frontend.log"
  exit 1
fi

# Run the checks
echo "Running service checks..."
python "$ROOT/tools/check_services.py" --config "$CHECK_CFG"
echo "Service checks finished."
