# 🚀 Build and Run Kartavya Project Management System

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud like Neon)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb kartavya_pms

# Or use Neon cloud database (recommended)
# Get connection string from https://neon.tech
```

### 3. Environment Configuration
```bash
# Frontend environment
cp .env.local.example .env.local
# Edit .env.local with your settings

# Backend environment  
cp server/.env.example server/.env
# Edit server/.env with your database URL
```

### 4. Database Migration
```bash
cd server
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

### 5. Start the Application
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend (in new terminal)
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Demo Accounts
- **Admin**: admin@kartavya.com / admin123
- **Developer**: john@example.com / john123
- **Developer**: jane@example.com / jane123

## Build for Production
```bash
# Build frontend
npm run build

# Start production server
npm start

# Backend production
cd server
npm start
```

## Troubleshooting
- Ensure PostgreSQL is running
- Check environment variables are set correctly
- Verify Node.js version is 18+
- Check ports 3000 and 5000 are available