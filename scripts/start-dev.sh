#!/bin/bash

echo "🚀 Starting Kartavya Development Environment..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "🔧 Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait
