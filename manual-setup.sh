#!/bin/bash

echo "🚀 Manual Setup for Kartavya Project Management System..."

# Create project directory
mkdir -p kartavya-pms
cd kartavya-pms

# Initialize the project structure
mkdir -p server/{controllers,middleware,routes,config,scripts,tests}
mkdir -p prisma
mkdir -p app/{login,register,projects,boards}
mkdir -p components/ui
mkdir -p hooks
mkdir -p lib
mkdir -p scripts

echo "✅ Project structure created"

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if we have a database connection
echo "📊 Database setup options:"
echo "1. Use Neon (cloud PostgreSQL) - Recommended"
echo "2. Use local PostgreSQL"
echo "3. Use Docker PostgreSQL"
echo ""
echo "Since you have Neon integration available, we'll use that."

# Create package.json files
echo "📦 Creating package.json files..."

# Frontend package.json
cat > package.json << 'EOF'
{
  "name": "kartavya-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-badge": "^1.0.4",
    "@radix-ui/react-button": "^1.0.4",
    "@radix-ui/react-card": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-input": "^1.0.4",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "axios": "^1.6.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "react": "^18",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18",
    "react-hot-toast": "^2.4.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-beautiful-dnd": "^13.1.8",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
EOF

# Backend package.json
cat > server/package.json << 'EOF'
{
  "name": "kartavya-backend",
  "version": "1.0.0",
  "description": "Backend API for Kartavya Project Management System",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node scripts/seed.js"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.7.1"
  }
}
EOF

echo "✅ Package.json files created"

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

echo "✅ Dependencies installed"

# Create environment files
echo "🔧 Creating environment files..."

cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

cat > server/.env << 'EOF'
# Database - Update this with your Neon database URL
DATABASE_URL="your-neon-database-url-here"

# JWT
JWT_SECRET="kartavya-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
EOF

echo "✅ Environment files created"

echo ""
echo "🎉 Manual setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update server/.env with your Neon database URL"
echo "2. Run: cd server && npm run db:generate"
echo "3. Run: cd server && npm run db:push"
echo "4. Run: cd server && npm run db:seed"
echo "5. Start backend: cd server && npm run dev"
echo "6. Start frontend: npm run dev"
echo ""
echo "🌐 Access your application at: http://localhost:3000"
echo "📊 API will be available at: http://localhost:5000"
