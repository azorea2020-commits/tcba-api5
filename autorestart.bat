@echo off
title TCBA API Auto-Restart
cd /d "F:\tcba-api"

echo ------------------------------------------
echo  TCBA API Restart Utility
echo  (C) Treasure Coast Bee Association
echo ------------------------------------------
echo.

:: Stop any running Node server on port 5000
echo Checking for running Node processes...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":5000" ^| find "LISTENING"') do (
    echo Found Node process on port 5000, PID=%%a
    taskkill /PID %%a /F >nul 2>&1
    echo ✅ Old server stopped.
)

:: Start the API
echo.
echo 🚀 Starting TCBA API...
npm start

pause
