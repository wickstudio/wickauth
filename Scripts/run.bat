@echo off
echo ======================================
echo WickAuth Launcher
echo ======================================

if exist "dist\win-unpacked\WickAuth.exe" (
    echo Starting portable version...
    start "" "dist\win-unpacked\WickAuth.exe"
) else (
    echo Starting regular version...
    start /b "" npm run start
)
exit 