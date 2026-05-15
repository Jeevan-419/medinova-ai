@echo off
title Stop MediNova AI
color 0C

echo =======================================================
echo           STOPPING MEDINOVA AI SERVERS
echo =======================================================
echo.
echo Closing Node.js and Vite processes...
taskkill /F /IM node.exe > NUL 2>&1
echo.
echo All processes terminated successfully!
echo =======================================================
pause
