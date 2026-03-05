@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm was not found. Please install Node.js LTS first.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] node_modules not found. Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
  )
)

set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":5173 .*LISTENING"') do (
  set "PORT_PID=%%P"
  goto :port_check_done
)
:port_check_done

if defined PORT_PID (
  echo [INFO] Port 5173 is already in use by PID !PORT_PID!.
  echo [INFO] Dev server may already be running. Opening browser only.
  start "" "http://127.0.0.1:5173"
  pause
  exit /b 0
)

echo [INFO] Starting dev server...
echo [INFO] Open http://127.0.0.1:5173 in your browser.
call npm run dev

if errorlevel 1 (
  echo [ERROR] Dev server exited with an error.
)

echo [INFO] Dev server stopped.
pause
