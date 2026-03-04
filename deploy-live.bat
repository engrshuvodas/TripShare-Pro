@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo TripShare-Pro — Build & Run Locally + Chrome
echo ==========================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm ci
    if !ERRORLEVEL! NEQ 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo.
echo Building production...
call npm run build
if !ERRORLEVEL! NEQ 0 (
    echo Build failed.
    pause
    exit /b 1
)

echo.
echo Starting local server on http://localhost:5000...
timeout /t 1

REM Check if serve is installed globally
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing 'serve' globally...
    npm install -g serve
)

REM Try to find Chrome in common locations
set "chrome_paths=C:\Program Files\Google\Chrome\Application\chrome.exe" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

for %%G in (%chrome_paths%) do (
    if exist "%%G" (
        echo Opening Chrome at http://localhost:5000
        start "" "%%G" "http://localhost:5000"
        goto serve
    )
)

REM If Chrome not found, try default browser
echo Opening in default browser...
start http://localhost:5000

:serve
REM Serve the dist folder
serve dist -l 5000
endlocal
