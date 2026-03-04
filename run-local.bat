@echo off
setlocal

echo ==========================================
echo TripShare-Pro — Local helper
echo ==========================================




























































exit /bendlocal:endgoto endnpx --yes serve dist -l 5000echo Serving 'dist' using npx serve on http://localhost:5000)    goto menu    pause >nul    echo The 'dist' folder was not found. Run option 3 to build first.if not exist dist (:serve
goto endnpm run previewecho Running `vite preview` to serve the built app...:previewgoto menupause >nulecho Build completed. Press any key to return to menu.npm run buildecho Building production (Vite)...:buildgoto endnpm run devecho If the command doesn't start, try running Git Bash or WSL.echo Starting dev server (Vite)...:devgoto menupause >nulecho Installation finished. Press any key to return to menu.echo.npm ciecho Installing dependencies...:installgoto menu
necho Invalid choice.if "%choice%"=="6" goto endif "%choice%"=="5" goto serveif "%choice%"=="4" goto previewif "%choice%"=="3" goto buildif "%choice%"=="2" goto devif "%choice%"=="1" goto installset choice=%ERRORLEVEL%
nchoice /C 123456 /N /M "Choose an option [1-6]: " >nulecho 6) Exitecho 5) Serve `dist` (npx serve dist -l 5000)echo 4) Preview build (npm run preview)echo 3) Build production (npm run build)echo 2) Start dev server (npm run dev)echo 1) Install dependencies (npm ci)echo.:menu