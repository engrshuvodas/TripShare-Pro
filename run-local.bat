@echo off
setlocal
title TripSplit Pro - Local Run
cd /d "%~dp0"

echo ==========================================
echo    🚀 TripSplit Pro - Local Development Launcher
echo ==========================================

:: ensure dependencies are installed
if not exist "node_modules\" (
    echo [📦] Running npm install...
    npm install || (
        echo [❌] npm install failed, aborting.
        pause
        exit /b 1
    )
)

echo [⚡] Launching Vite dev server...
start "TripSplit Dev" cmd /k "cd /d "%~dp0" && npm run dev"
echo [🌐] Opening browser in a few seconds...
timeout /t 3 >nul
start "" http://localhost:5173
echo [✅] All set!  Keep the new window open to see server logs.
pause
