@echo off
setlocal
title 🚀 TCBA Frontend Deployment

REM === CONFIGURATION ===
set SRC=F:\public_html\frontend
set DEST=F:\public_html

echo.
echo 🚿 Cleaning up old frontend files in %DEST%...
for %%f in (index.html login.html signup.html welcome.html script.js style.css config.js) do (
    if exist "%DEST%\%%f" (
        del /Q "%DEST%\%%f"
        echo Deleted: %%f
    )
)

echo.
echo 📦 Copying new frontend files from %SRC% to %DEST%...
xcopy "%SRC%\index.html" "%DEST%\" /Y
xcopy "%SRC%\login.html" "%DEST%\" /Y
xcopy "%SRC%\signup.html" "%DEST%\" /Y
xcopy "%SRC%\welcome.html" "%DEST%\" /Y
xcopy "%SRC%\script.js" "%DEST%\" /Y
xcopy "%SRC%\style.css" "%DEST%\" /Y
xcopy "%SRC%\config.js" "%DEST%\" /Y

echo.
echo ✅ Frontend deployment complete!
echo 📂 Files copied to: %DEST%
pause
