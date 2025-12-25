param()
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BackendDir = Join-Path $Root 'backend'
$FrontendDir = Join-Path $Root 'frontend'
$CheckCfg = Join-Path $Root 'tools\services.example.json'
$logDir = Join-Path $env:TEMP 'ctlg-checks'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Wait-ForUrl($url, $timeoutSec = 30) {
  $end = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $end) {
    try {
      $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
      Write-Host "[OK] $url -> $($resp.StatusCode)"
      return $true
    } catch { Start-Sleep -Seconds 1 }
  }
  Write-Host "[TIMEOUT] waiting for $url"
  return $false
}

# Start backend
Write-Host "Starting backend..."
Push-Location $BackendDir
if (Test-Path requirements.txt) { pip install -r requirements.txt | Out-Null }
python manage.py migrate --noinput
$backendProc = Start-Process -FilePath "python" -ArgumentList "manage.py runserver 127.0.0.1:8000" -RedirectStandardOutput "$logDir\backend.log" -RedirectStandardError "$logDir\backend.log" -PassThru
Pop-Location

if (-not (Wait-ForUrl "http://127.0.0.1:8000/api/health/" 30)) {
  Write-Error "Backend failed to start. See $logDir\backend.log"
  exit 1
}

# Build & serve frontend
Write-Host "Preparing frontend..."
Push-Location $FrontendDir
npm ci --silent
npm run build --if-present
$frontendProc = Start-Process -FilePath "npx" -ArgumentList "serve -s dist -l 5173" -RedirectStandardOutput "$logDir\frontend.log" -RedirectStandardError "$logDir\frontend.log" -PassThru
Pop-Location

if (-not (Wait-ForUrl "http://localhost:5173/" 30)) {
  Write-Error "Frontend failed to start. See $logDir\frontend.log"
  exit 1
}

# Run checks
Write-Host "Running service checks..."
python "$CheckCfg" | Out-Null
Write-Host "Service checks finished."

# Cleanup (background processes will end when runner stops; attempt to stop)
try { $backendProc | Stop-Process -ErrorAction SilentlyContinue } catch {}
try { $frontendProc | Stop-Process -ErrorAction SilentlyContinue } catch {}
