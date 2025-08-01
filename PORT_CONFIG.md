# Port Configuration Summary

## Current Configuration

### Frontend (Next.js)
- **Port**: 3001 (auto-switched from 3000)
- **URL**: http://localhost:3001
- **Start Command**: `npm run dev`

### Backend (Express.js)
- **Port**: 5000
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Start Command**: `cd server && npm start`

### Database (PostgreSQL)
- **Port**: 5432 (default)
- **Database**: kartavya_pms
- **URL**: postgresql://postgres:postgres@localhost:5432/kartavya_pms

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```
PORT=5000
FRONTEND_URL="http://localhost:3001"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kartavya_pms"
```

## Fixed Issues

1. ✅ **CORS Configuration**: Updated to allow ports 3000 and 3001
2. ✅ **Hardcoded URLs**: Replaced with environment variables
3. ✅ **Port Consistency**: All references now use correct ports
4. ✅ **API Client**: Uses environment variable for base URL

## How to Start

1. **Database**: Ensure PostgreSQL is running on port 5432
2. **Backend**: `cd server && npm start` (runs on port 5000)
3. **Frontend**: `npm run dev` (runs on port 3000)

## Access URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health