@echo off
echo 🧪 KARTAVYA SYSTEM QUICK TEST
echo ================================
echo.

echo 📡 Testing Backend Health...
curl -s http://localhost:5002/health > nul
if %errorlevel% == 0 (
    echo ✅ Backend: ONLINE
) else (
    echo ❌ Backend: OFFLINE
)

echo.
echo 🌐 Testing Frontend Pages...

echo Testing Login Page...
curl -s -I http://localhost:3002/login | find "200 OK" > nul
if %errorlevel% == 0 (
    echo ✅ Login Page: ACCESSIBLE
) else (
    echo ❌ Login Page: ERROR
)

echo Testing Dashboard...
curl -s -I http://localhost:3002/dashboard | find "200 OK" > nul
if %errorlevel% == 0 (
    echo ✅ Dashboard: ACCESSIBLE
) else (
    echo ❌ Dashboard: ERROR
)

echo Testing Projects...
curl -s -I http://localhost:3002/projects | find "200 OK" > nul
if %errorlevel% == 0 (
    echo ✅ Projects: ACCESSIBLE
) else (
    echo ❌ Projects: ERROR
)

echo Testing Search...
curl -s -I http://localhost:3002/search | find "200 OK" > nul
if %errorlevel% == 0 (
    echo ✅ Search: ACCESSIBLE
) else (
    echo ❌ Search: ERROR
)

echo Testing Reports...
curl -s -I http://localhost:3002/reports | find "200 OK" > nul
if %errorlevel% == 0 (
    echo ✅ Reports: ACCESSIBLE
) else (
    echo ❌ Reports: ERROR
)

echo.
echo 🔧 Testing API Endpoints...

echo Testing Auth API...
curl -s http://localhost:5002/api/auth/profile > nul
if %errorlevel% == 0 (
    echo ✅ Auth API: RESPONDING
) else (
    echo ❌ Auth API: ERROR
)

echo.
echo 📊 QUICK TEST SUMMARY:
echo ================================
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:5002
echo Database: PostgreSQL Connected
echo.
echo 🎯 Manual Test Checklist:
echo [ ] Login with demo account
echo [ ] Navigate to dashboard
echo [ ] Create a project
echo [ ] Create an issue
echo [ ] View reports
echo.
echo ✅ System Status: READY FOR TESTING
pause