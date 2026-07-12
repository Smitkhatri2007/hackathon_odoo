@echo off
title TransitOps Launcher
color 0B

echo ========================================================
echo   Starting TransitOps Fleet Management System
echo ========================================================
echo.

:: Add Location in Main File to ensure it runs from the correct path
cd /d "%~dp0"

echo [1/3] Starting Spring Boot Backend Database...
echo Please wait, this runs purely in this window...
cd backend
start /B mvn spring-boot:run
cd ..

echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak > nul

echo [2/3] Starting React Frontend UI...
cd frontend
start /B npm run dev
cd ..

echo Waiting for frontend to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

echo [3/3] Launching TransitOps in your Default Browser...
start http://localhost:5173

echo.
echo ========================================================
echo TransitOps is now running purely in this single app file! 
echo Press CTRL+C or close this window to stop everything.
echo ========================================================
pause
