#!/bin/bash

echo "🚀 Kartavya Quick Start (No Download Required)"
echo ""

# Function to create a file with content
create_file() {
    local file_path="$1"
    local content="$2"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$file_path")"
    
    # Create file with content
    echo "$content" > "$file_path"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root of your Kartavya project"
    echo "Or create a new directory: mkdir kartavya && cd kartavya"
    exit 1
fi

echo "✅ Setting up Kartavya in current directory..."

# Create basic structure
mkdir -p server/{controllers,middleware,routes,config,scripts}
mkdir -p prisma
mkdir -p app/{login,register,projects,boards}
mkdir -p hooks
mkdir -p lib

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install next@14.0.4 react@18 react-dom@18 typescript@5 @types/react@18 @types/node@20 tailwindcss@3.4.17 autoprefixer@10 postcss@8 axios@1.6.2 react-hot-toast@2.4.1 framer-motion@10.16.16 lucide-react@0.294.0

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm init -y
npm install express@4.18.2 @prisma/client@5.7.1 prisma@5.7.1 bcrypt@5.1.1 jsonwebtoken@9.0.2 cors@2.8.5 dotenv@16.3.1 nodemon@3.0.2
cd ..

echo "✅ Dependencies installed"

# Create essential files
echo "🔧 Creating essential configuration files..."

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
EOF

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create basic environment files
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

cat > server/.env << 'EOF'
DATABASE_URL="postgresql://username:password@localhost:5432/kartavya_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
EOF

echo "✅ Configuration files created"

echo ""
echo "🎉 Quick setup complete!"
echo ""
echo "📋 To complete the setup:"
echo "1. Update server/.env with your database URL"
echo "2. Copy the Prisma schema and other files from the v0 project"
echo "3. Run: cd server && npx prisma generate"
echo "4. Run: cd server && npx prisma db push"
echo "5. Start development servers"
echo ""
echo "🔧 Development commands:"
echo "Backend: cd server && npm run dev"
echo "Frontend: npm run dev"
