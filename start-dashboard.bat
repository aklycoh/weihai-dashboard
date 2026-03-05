@echo off
setlocal

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

echo [INFO] Starting dev server...
echo [INFO] Open http://localhost:5173 in your browser.
call npm run dev

if errorlevel 1 (
  echo [ERROR] Dev server exited with an error.
)

echo [INFO] Dev server stopped.
pause
