@echo off
echo ========================================
echo  TripShare-Pro v2.2 - Local Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing dependencies...
pip install -r requirements.txt

REM Start the Flask application
echo [INFO] Starting TripShare-Pro server...
echo.
python app.py

pause
