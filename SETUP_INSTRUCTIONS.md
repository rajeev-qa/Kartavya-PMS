# Kartavya Setup Instructions

## 🚨 Security Issue Solution

If you're seeing a "setup.sh doesn't support a secure connection with HTTPS" error, follow these alternative setup methods:

## Method 1: Manual Setup (Recommended)

### Step 1: Create Project Structure
\`\`\`bash
mkdir kartavya-pms
cd kartavya-pms
mkdir -p server/{controllers,middleware,routes,config,scripts}
mkdir -p prisma
mkdir -p app/{login,register,projects,boards}
mkdir -p hooks lib components/ui
\`\`\`

### Step 2: Initialize Package Files
\`\`\`bash
# Frontend
npm init -y
npm install next@14.0.4 react@18 react-dom@18 typescript@5 @types/react@18 @types/node@20 tailwindcss@3.4.17 axios@1.6.2 react-hot-toast@2.4.1 framer-motion@10.16.16 lucide-react@0.294.0

# Backend
cd server
npm init -y
npm install express@4.18.2 @prisma/client@5.7.1 prisma@5.7.1 bcrypt@5.1.1 jsonwebtoken@9.0.2 cors@2.8.5 dotenv@16.3.1 nodemon@3.0.2
cd ..
\`\`\`

### Step 3: Environment Setup
Create `.env.local` in root:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

Create `server/.env`:
\`\`\`env
DATABASE_URL="your-database-url-here"
JWT_SECRET="kartavya-secret-key-2024"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
\`\`\`

### Step 4: Copy Project Files
Since you have access to the v0 project, copy all the generated files:
- Copy all files from the CodeProject to your local directory
- Ensure proper file structure matches the generated code

### Step 5: Database Setup
\`\`\`bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
\`\`\`

### Step 6: Start Development
\`\`\`bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
\`\`\`

## Method 2: Using Neon Database (Cloud)

Since you have Neon integration available:

1. **Create Neon Database:**
   - Go to your Neon dashboard
   - Create a new database named `kartavya_db`
   - Copy the connection string

2. **Update Environment:**
   \`\`\`env
   DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/kartavya_db?sslmode=require"
   \`\`\`

3. **Run Setup:**
   \`\`\`bash
   cd server
   npx prisma db push
   npx prisma db seed
   \`\`\`

## Method 3: Docker Setup (Alternative)

If you prefer Docker:

\`\`\`bash
# Create docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: kartavya_db
      POSTGRES_USER: kartavya
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

# Start database
docker-compose up -d postgres

# Update DATABASE_URL
DATABASE_URL="postgresql://kartavya:password@localhost:5432/kartavya_db"
\`\`\`

## Troubleshooting

### Issue: "setup.sh doesn't support secure connection"
**Solution:** Don't download the script. Use manual setup instead.

### Issue: Database connection failed
**Solutions:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL format
3. Ensure database exists
4. Check firewall settings

### Issue: Port already in use
**Solutions:**
\`\`\`bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Or use different ports
PORT=5001 npm run dev  # Backend
npm run dev -- -p 3001  # Frontend
\`\`\`

### Issue: Prisma client not generated
**Solution:**
\`\`\`bash
cd server
npx prisma generate
npx prisma db push
\`\`\`

## Verification Steps

1. **Backend Health Check:**
   \`\`\`bash
   curl http://localhost:5000/health
   \`\`\`

2. **Frontend Access:**
   Open http://localhost:3000

3. **Database Connection:**
   \`\`\`bash
   cd server
   npx prisma studio
   \`\`\`

## Demo Accounts

After seeding:
- Admin: `admin@kartavya.com` / `admin123`
- Developer: `john@example.com` / `john123`
- Developer: `jane@example.com` / `jane123`

## Support

If you encounter any issues:
1. Check the console logs
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check database connectivity
5. Restart both servers

The manual setup approach avoids the HTTPS security warning and gives you full control over the installation process.
