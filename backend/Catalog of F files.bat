@echo off
REM === TCBA File Inventory Script ===
REM Scans F: drive and lists all files into F_drive_inventory.txt

set DRIVE=F:\
set OUTPUT=C:\TCBA\F_drive_inventory.txt

echo -------------------------------------------
echo  Scanning %DRIVE% ...
echo  Saving results to %OUTPUT%
echo -------------------------------------------

:: Ensure destination folder exists
if not exist "C:\TCBA\" mkdir "C:\TCBA\"

:: Generate inventory with file sizes and dates
dir %DRIVE% /S /O:N > "%OUTPUT%"

echo ✅ Inventory complete!
echo Open %OUTPUT% in Notepad to view the list of files.
echo.
pause
