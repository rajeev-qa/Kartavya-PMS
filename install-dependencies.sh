#!/bin/bash

echo "📦 Installing Kartavya Dependencies..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    npm init -y
fi

echo "🎨 Installing frontend dependencies..."

# Core Next.js and React
npm install next@14.0.4 react@18 react-dom@18

# TypeScript
npm install -D typescript@5 @types/react@18 @types/node@20 @types/react-dom@18

# Styling
npm install tailwindcss@3.4.17 autoprefixer@10 postcss@8
npm install -D eslint@8 eslint-config-next@14.0.4

# UI Components (Radix UI)
npm install @radix-ui/react-avatar@1.0.4
npm install @radix-ui/react-badge@1.0.4
npm install @radix-ui/react-button@1.0.4
npm install @radix-ui/react-card@1.0.4
npm install @radix-ui/react-dropdown-menu@2.0.6
npm install @radix-ui/react-input@1.0.4
npm install @radix-ui/react-label@2.0.2
npm install @radix-ui/react-progress@1.0.3
npm install @radix-ui/react-slot@1.0.2

# Utilities
npm install class-variance-authority@0.7.0
npm install clsx@2.0.0
npm install tailwind-merge@2.2.0
npm install tailwindcss-animate@1.0.7

# HTTP Client and State Management
npm install axios@1.6.2

# UI Enhancements
npm install framer-motion@10.16.16
npm install react-beautiful-dnd@13.1.1
npm install -D @types/react-beautiful-dnd@13.1.8
npm install react-hot-toast@2.4.1

# Icons
npm install lucide-react@0.294.0

echo "✅ Frontend dependencies installed"

# Backend dependencies
echo "🔧 Installing backend dependencies..."

cd server

if [ ! -f "package.json" ]; then
    echo "Creating backend package.json..."
    npm init -y
fi

# Core backend
npm install express@4.18.2
npm install cors@2.8.5
npm install dotenv@16.3.1

# Database
npm install @prisma/client@5.7.1
npm install -D prisma@5.7.1

# Authentication
npm install bcrypt@5.1.1
npm install jsonwebtoken@9.0.2

# File upload
npm install multer@1.4.5-lts.1

# Development
npm install -D nodemon@3.0.2

echo "✅ Backend dependencies installed"

cd ..

echo "🎉 All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the project files from v0"
echo "2. Set up environment variables"
echo "3. Initialize database"
echo "4. Start development servers"
