#!/bin/bash

echo "🚀 Setting up Kartavya Project Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create database
echo "📊 Setting up database..."
createdb c_pms_z 2>/dev/null || echo "Database might already exist"

# Setup backend
echo "🔧 Setting up backend..."
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

echo "✅ Backend setup complete"

# Setup frontend
echo "🎨 Setting up frontend..."
cd ..

# Install dependencies
npm install

echo "✅ Frontend setup complete"

echo "🎉 Setup complete! You can now start the application:"
echo "1. Start backend: cd server && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Access application at http://localhost:3000"
echo ""
echo "Demo accounts:"
echo "- Admin: admin@kartavya.com / admin123"
echo "- Developer: john@example.com / john123"
echo "- Developer: jane@example.com / jane123"
