@echo off
title Launching MediNova AI
color 0B

echo =======================================================
echo          STARTING MEDINOVA AI HOSPITAL SYSTEM
echo =======================================================
echo.

REM Check if node_modules exists in root
if not exist "node_modules\" (
    echo [1/3] First time setup: Installing dependencies...
    echo This will install backend and frontend packages automatically.
    echo Please wait...
    call npm run install-all
    echo Dependencies installed successfully!
    echo.
) else (
    echo [1/3] Dependencies found.
)

echo [2/3] Starting Servers...
start /MIN "MediNova Servers" cmd /c "npm run dev"

echo.
echo Waiting for servers to initialize (5 seconds)...
timeout /t 5 /nobreak > NUL

echo [3/3] Opening MediNova in your default web browser...
start http://localhost:5173

echo.
echo =======================================================
echo [SUCCESS] MEDINOVA AI IS RUNNING!
echo.
echo The servers are running in minimized background windows.
echo To stop the system safely, run "stop-app.bat".
echo =======================================================
echo.
pause
