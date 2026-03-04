@echo off
echo Starting TripSplit Pro v2.2 Local Environment...

:: Check for Vercel CLI (Recommended)
where vercel >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Vercel CLI found. Running 'vercel dev'...
    vercel dev
    pause
    exit /b
)

echo [INFO] Vercel CLI not found. Falling back to Flask + Browser window...

:: Install requirements
echo [STEP 1] Installing Python requirements...
pip install -r requirements.txt

:: Start Flask Backend in a new window
echo [STEP 2] Starting Flask Backend...
start "TripSplit Backend" cmd /k "python -m api.index"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Open Frontend
echo [STEP 3] Opening Frontend...
start index.html

echo.
echo ==================================================
echo TripSplit Pro v2.2 is now running!
echo Backend: Check the new command window for logs.
echo Frontend: Opened in your default browser.
echo ==================================================
echo.
pause
