# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/Kartavya-PMS.git
   cd Kartavya-PMS
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb kartavya_pms
   # Or using psql
   psql -U postgres -c "CREATE DATABASE kartavya_pms;"
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Setup database schema
   npx prisma generate
   npx prisma db push
   
   # Seed database with sample data
   npm run db:seed
   
   # Start backend server
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd .. # Back to root directory
   npm install
   
   # Create environment file (if needed)
   cp .env.local.example .env.local
   
   # Start frontend development server
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Board: http://localhost:3000/projects/1/board

## Production Deployment

### Backend (Railway/Heroku)

1. **Prepare for deployment**
   ```bash
   cd server
   # Ensure all dependencies are in package.json
   npm install --production
   ```

2. **Environment Variables**
   Set these in your hosting platform:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5000
   ```

3. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

### Frontend (Vercel/Netlify)

1. **Build Configuration**
   ```bash
   # Ensure build works locally
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

### Database (PostgreSQL)

#### Option 1: Railway PostgreSQL
```bash
railway add postgresql
```

#### Option 2: Supabase
1. Create project at supabase.com
2. Get connection string
3. Update DATABASE_URL

#### Option 3: Neon
1. Create database at neon.tech
2. Get connection string
3. Update DATABASE_URL

### Docker Deployment

1. **Backend Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx prisma generate
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Frontend Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:14
       environment:
         POSTGRES_DB: kartavya_pms
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
     
     backend:
       build: ./server
       environment:
         DATABASE_URL: postgresql://postgres:postgres@db:5432/kartavya_pms
         JWT_SECRET: your-secret-key
       ports:
         - "5000:5000"
       depends_on:
         - db
     
     frontend:
       build: .
       environment:
         NEXT_PUBLIC_API_URL: http://localhost:5000
       ports:
         - "3000:3000"
       depends_on:
         - backend
   
   volumes:
     postgres_data:
   ```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Post-Deployment

1. **Database Migration**
   ```bash
   # On production server
   npx prisma db push
   npm run db:seed
   ```

2. **Health Checks**
   - Backend: `GET /api/health`
   - Frontend: Check homepage loads
   - Database: Verify connection

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor performance
   - Set up logging

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

2. **CORS Issues**
   - Update CORS origins in backend
   - Check API URL in frontend

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check environment variables

4. **Permission Issues**
   - Verify JWT_SECRET is set
   - Check user roles in database
   - Ensure permissions are seeded

### Logs and Debugging

```bash
# Backend logs
npm run dev # Development
pm2 logs # Production with PM2

# Frontend logs
npm run dev # Development
vercel logs # Vercel deployment

# Database logs
# Check your hosting provider's dashboard
```

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Database credentials secured
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Environment variables not in code
- [ ] Database backups configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error messages don't expose sensitive data