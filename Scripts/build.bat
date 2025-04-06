@echo off
echo ======================================
echo Building WickAuth Application
echo ======================================

echo Cleaning previous builds...
if exist "out" rmdir /s /q "out"
if exist ".next" rmdir /s /q ".next"

echo Installing dependencies...
call npm install

echo Building application...
call npm run build

echo Build complete! Run start.bat to launch the application. 