# Database Setup Guide

## Prerequisites
- PostgreSQL 12+ installed
- Node.js 18+ installed

## Database Setup

### 1. Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE kartavya_pms;

-- Create user (optional)
CREATE USER kartavya_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kartavya_pms TO kartavya_user;
```

### 2. Environment Configuration
Create `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kartavya_pms"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### 3. Database Schema Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
```

### 4. Seed Database
```bash
npm run db:seed
```

## Database Schema Overview

### Core Tables
- **users** - User accounts with roles
- **roles** - User roles (Administrator, Developer, Viewer)
- **role_permissions** - Role-based permissions
- **projects** - Project management
- **project_users** - Project team members
- **issues** - Tasks, bugs, stories, epics
- **sprints** - Agile sprint management
- **sprint_issues** - Issues assigned to sprints

### Sample Data
After seeding, you'll have:
- **Admin user**: admin@kartavya.com / admin123
- **Developer users**: john@example.com / john123, jane@example.com / jane123
- **Sample project**: E-commerce Platform (ECOM)
- **Sample issues**: Authentication, Product catalog, Bug fixes
- **Active sprint**: Sprint 1 - Foundation

## Permissions System

### Administrator
- Full system access
- All CRUD operations
- User management
- System settings

### Developer
- Project and issue management
- Create, edit, delete issues
- Sprint management
- Reporting access

### Viewer
- Read-only access
- View projects and issues
- View reports and sprints

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin only)

### Issues
- `GET /api/issues` - List issues
- `GET /api/issues/:id` - Get issue details
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Sprints
- `GET /api/sprints/:projectId` - List project sprints
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints/:id` - Update sprint

## Troubleshooting

### Common Issues
1. **Connection refused**: Check PostgreSQL is running
2. **Permission denied**: Verify database user permissions
3. **Schema errors**: Run `npx prisma db push` to sync schema
4. **Seed errors**: Check user roles exist before seeding

### Reset Database
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS kartavya_pms;"
psql -U postgres -c "CREATE DATABASE kartavya_pms;"

# Recreate schema and seed
cd server
npx prisma db push
npm run db:seed
```