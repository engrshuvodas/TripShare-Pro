@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo TripShare-Pro Build and Run
echo ==========================================
echo.

REM Step 1: Install dependencies
echo [1/3] Installing dependencies...
call npm install
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

REM Step 2: Build
echo.
echo [2/3] Building project...
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

REM Step 3: Start server
echo.
echo [3/3] Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server.
echo.

REM Install serve if needed
npm list -g serve >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo Installing serve...
    npm install -g serve
)

REM Open Chrome
for %%G in (
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) do (
    if exist %%G (
        start "" %%G "http://localhost:5000"
        goto run_server
    )
)

echo.
echo Open your browser: http://localhost:5000
echo.

:run_server
timeout /t 2
call serve dist -l 5000
endlocal
