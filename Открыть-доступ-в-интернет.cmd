@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 3; if ($response.StatusCode -ne 200) { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
  echo First run npm run phone in another PowerShell window and keep it open.
  pause
  exit /b 1
)
echo Creating a temporary public link for the game...
echo Keep this window open. Press Ctrl+C to close Internet access.
set "TUNNEL_TRANSPORT_PROTOCOL=http2"
call npx.cmd wrangler tunnel quick-start http://localhost:4173
if errorlevel 1 pause
