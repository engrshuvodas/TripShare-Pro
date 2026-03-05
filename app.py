#!/usr/bin/env python3
"""
TripShare-Pro Main Application
Starts the Flask development server with all features enabled
"""

import os
import sys
import webbrowser
import time
from pathlib import Path

# Ensure we're in the project root
PROJECT_ROOT = Path(__file__).parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))

# Change to project root
os.chdir(PROJECT_ROOT)

# Import Flask app from the api module
from api.index import app

def open_browser():
    """Open the app in the default browser after a delay"""
    time.sleep(2)
    print("[INFO] Opening browser to http://127.0.0.1:5000...\n")
    
    # Try to open in Chrome first
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    
    opened = False
    for chrome_path in chrome_paths:
        if os.path.exists(chrome_path):
            import subprocess
            subprocess.Popen([chrome_path, "http://127.0.0.1:5000"])
            opened = True
            break
    
    # Fallback to default browser
    if not opened:
        webbrowser.open("http://127.0.0.1:5000")

if __name__ == '__main__':
    print("\n" + "="*70)
    print(" TripShare-Pro v2.2 - Local Development Server")
    print("="*70)
    print("\n[INFO] Backend: http://127.0.0.1:5000")
    print("[INFO] Frontend: http://127.0.0.1:5000")
    print("[INFO] Press Ctrl+C to stop the server\n")
    print("="*70 + "\n")
    
    try:
        # Open browser in background thread
        import threading
        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()
        
        # Run Flask development server
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            use_reloader=True
        )
        
    except KeyboardInterrupt:
        print("\n\n[STOP] Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Failed to start server: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
