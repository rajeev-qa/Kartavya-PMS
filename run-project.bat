@echo off
echo 🚀 Starting Kartavya Project Management System...
echo.

echo 📊 Setting up database...
cd /d "%~dp0"
npx prisma generate
npx prisma db push

echo 🌱 Seeding database...
cd server
npm run db:seed

echo 🖥️ Starting backend server...
start "Kartavya Backend" cmd /k "npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🌐 Starting frontend server...
cd ..
start "Kartavya Frontend" cmd /k "npm run dev"

echo.
echo ✅ Kartavya is starting up!
echo 🌐 Frontend: http://localhost:3000
echo 📊 Backend API: http://localhost:5000
echo.
echo 👤 Demo accounts:
echo    Admin: admin@kartavya.com / admin123
echo    John: john@example.com / john123
echo    Jane: jane@example.com / jane123
echo.
pause