@echo off
echo Starting Kartavya Development Servers...
echo.

echo Starting Backend Server (Port 5000)...
start "Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3001)...
start "Frontend" cmd /k "npm run dev -- -p 3001"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:3001
echo Backend: http://localhost:5000
echo.
pause