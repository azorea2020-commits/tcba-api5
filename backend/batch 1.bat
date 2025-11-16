@echo off
REM === TCBA Important Files Sync Script ===
REM Copies only selected important folders from F:\ to C:\TCBA\

set SOURCE=F:\
set DEST=C:\TCBA\

echo -------------------------------------------
echo  TCBA Important Files Sync
echo  From: %SOURCE%
echo  To:   %DEST%
echo -------------------------------------------

:: Ensure destination exists
if not exist "%DEST%" (
    echo Creating destination folder...
    mkdir "%DEST%"
)

:: Copy ONLY these important folders (edit list as needed)
robocopy "%SOURCE%TCBA_Site" "%DEST%TCBA_Site" /E /MIR
robocopy "%SOURCE%Beepics" "%DEST%Beepics" /E /MIR
robocopy "%SOURCE%Docs" "%DEST%Docs" /E /MIR
robocopy "%SOURCE%Backups" "%DEST%Backups" /E /MIR

:: Notes:
:: /E   = include subfolders (even empty ones)
:: /MIR = mirror (keeps laptop copy identical, deletes old junk)

echo ✅ Sync complete! Important files are now at %DEST%
echo.
pause
