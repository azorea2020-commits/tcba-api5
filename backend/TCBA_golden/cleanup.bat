@echo off
setlocal enabledelayedexpansion

REM ==========================
REM TCBA Frontend Cleanup Script
REM ==========================

set "FRONTEND_DIR=F:\TCBA_golden"
set "CLEAN_DIR=%FRONTEND_DIR%\frontend_clean"

echo Cleaning up old frontend_clean folder...
if exist "%CLEAN_DIR%" rmdir /s /q "%CLEAN_DIR%"

echo Creating new clean folder...
mkdir "%CLEAN_DIR%"

echo Copying essential frontend files...
if exist "%FRONTEND_DIR%\login.html" copy "%FRONTEND_DIR%\login.html" "%CLEAN_DIR%\" >nul
if exist "%FRONTEND_DIR%\welcome.html" copy "%FRONTEND_DIR%\welcome.html" "%CLEAN_DIR%\" >nul
if exist "%FRONTEND_DIR%\script.js" copy "%FRONTEND_DIR%\script.js" "%CLEAN_DIR%\" >nul
if exist "%FRONTEND_DIR%\style.css" copy "%FRONTEND_DIR%\style.css" "%CLEAN_DIR%\" >nul

echo Excluding junk files and folders...
for /d %%D in ("%FRONTEND_DIR%\*") do (
    if /I not "%%~nxD"=="node_modules" if /I not "%%~nxD"=="db" if /I not "%%~nxD"==".git" (
        xcopy "%%D" "%CLEAN_DIR%\%%~nxD\" /E /I /Q >nul
    )
)

echo ===============================
echo ✅ Frontend cleanup complete!
echo Clean folder ready at: %CLEAN_DIR%
echo ===============================
pause
