@echo off
REM Start Resume Builder - Backend and Frontend

echo Starting Resume Builder...
echo.

REM Kill any process using port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

REM Start Backend (Uvicorn without reload)
cd /d "%~dp0"
start cmd /k "cd /d "%~dp0backend" && python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start Frontend (npm with craco)
start cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both backend and frontend are starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
pause
