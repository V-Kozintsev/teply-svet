@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.18 or newer is required. Install it and try again.
  pause
  exit /b 1
)
call npm.cmd run build -- --outDir work/phone-preview
if errorlevel 1 (
  pause
  exit /b 1
)
echo Open http://YOUR-LOCAL-IP:4173/ on your phone.
echo Find your computer's IPv4 address with ipconfig.
echo Keep this window open. Press Ctrl+C to stop.
node node_modules\vite\bin\vite.js preview --outDir work/phone-preview --host 0.0.0.0 --port 4173 --strictPort
if errorlevel 1 pause
