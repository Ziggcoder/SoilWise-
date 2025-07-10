@echo off
echo Starting SoilWise Development Environment...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Install workspace dependencies
echo [INFO] Installing workspace dependencies...
if exist "apps\api-server" (
    cd apps\api-server
    if not exist "node_modules" npm install
    cd ..\..
)

if exist "apps\web-dashboard" (
    cd apps\web-dashboard
    if not exist "node_modules" npm install
    cd ..\..
)

if exist "apps\pwa-farmer" (
    cd apps\pwa-farmer
    if not exist "node_modules" npm install
    cd ..\..
)

if exist "apps\edge-hub" (
    cd apps\edge-hub
    if not exist "node_modules" npm install
    cd ..\..
)

echo.
echo [INFO] Dependencies installed successfully!
echo.
echo Starting development servers...
echo.
echo Web Dashboard: http://localhost:3000
echo PWA Farmer App: http://localhost:3001
echo API Server: http://localhost:8080
echo Edge Hub: http://localhost:3002
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start development servers using npm run dev
npm run dev
