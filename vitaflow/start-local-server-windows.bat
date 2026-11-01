@echo off
setlocal

cd /d "%~dp0"

if "%PORT%"=="" set "PORT=8787"
set "HTML_FILE=schedule-system-2.0.html"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js first: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "local-sync-server.mjs" (
  echo local-sync-server.mjs was not found in this folder.
  echo Please unzip the migration package completely before starting.
  echo.
  pause
  exit /b 1
)

for /f "usebackq delims=" %%T in (`node local-sync-server.mjs --print-token`) do set "TOKEN=%%T"

call :print_urls

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/api/health' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo VitaFlow local sync server is already running.
  echo.
  pause
  exit /b 0
)

echo Starting VitaFlow local sync server...
echo Keep this window open. Closing it stops phone/tablet access.
echo.

node local-sync-server.mjs %PORT%

echo.
echo Server stopped.
pause
exit /b 0

:print_urls
echo.
echo Access URLs (the "key" part is the access token, keep it private):
echo   This Windows PC: http://127.0.0.1:%PORT%/%HTML_FILE%?key=%TOKEN%
for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -notlike '198.18.*' -and $_.IPAddress -notlike '198.19.*' } | Select-Object -ExpandProperty IPAddress | Sort-Object -Unique"`) do (
  echo   Phone or tablet: http://%%I:%PORT%/%HTML_FILE%?key=%TOKEN%
)
echo.
exit /b 0
