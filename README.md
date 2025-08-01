# Kartavya PMS - Advanced Project Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-12+-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</div>

<div align="center">
  <h3>🚀 A comprehensive KARTAVYA-inspired project management system with enhanced board UI and role-based permissions</h3>
</div>

---

## ✨ Key Features

### 🎯 **Enhanced Kanban/Scrum Boards**
- **Beautiful UI**: Modern gradient design with drag-and-drop functionality
- **Permission-Based Controls**: Role-specific UI elements and actions
- **Real-time Updates**: Live notifications and status changes
- **Advanced Filtering**: Search by assignee, priority, type, and keywords
- **Swimlanes**: Group issues by assignee or epic
- **WIP Limits**: Work-in-progress limits with visual indicators

### 🔐 **Role-Based Permission System**
- **Administrator**: Full system access with all CRUD operations
- **Developer**: Issue management, sprint planning, and reporting
- **Viewer**: Read-only access to projects and issues
- **Granular Permissions**: Frontend UI controls + backend API protection

### 📊 **Project Management**
- **Issue Tracking**: Stories, Tasks, Bugs, Epics with custom fields
- **Sprint Management**: Plan, start, and complete sprints with burndown charts
- **Team Collaboration**: Comments, attachments, and work logs
- **Reporting**: Velocity tracking, burndown charts, and analytics
- **Version Management**: Release planning and tracking

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Beautiful DnD** for drag-and-drop
- **Framer Motion** for animations
- **React Hot Toast** for notifications

### Backend
- **Node.js** + **Express.js**
- **Prisma ORM** with **PostgreSQL**
- **JWT Authentication** with **bcrypt**
- **Role-based middleware** for API protection
- **Comprehensive error handling**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/rajeev-qa/Kartavya-PMS.git
cd Kartavya-PMS
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb kartavya_pms

# Or using psql
psql -U postgres -c "CREATE DATABASE kartavya_pms;"
```

### 3. Backend Configuration
```bash
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/kartavya_pms"
# JWT_SECRET="your-super-secret-jwt-key"

# Initialize database
npm run db:push
npm run db:seed

# Start backend server
npm run dev
```

### 4. Frontend Setup
```bash
# In new terminal, go back to root
cd ..
npm install

# Start frontend development server
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Enhanced Board**: http://localhost:3000/projects/1/board

## 👥 Demo Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@kartavya.com | admin123 | Full system access |
| **Developer** | john@example.com | john123 | Issue & sprint management |
| **Developer** | jane@example.com | jane123 | Issue & sprint management |

## 📁 Project Structure

```
Kartavya-PMS/
├── 📱 Frontend (Next.js)
│   ├── app/                    # App router pages
│   ├── components/             # Reusable components
│   ├── lib/                    # Utilities & API client
│   └── hooks/                  # Custom React hooks
│
├── 🖥️ Backend (Node.js)
│   ├── server/controllers/     # API controllers
│   ├── server/middleware/      # Auth & permissions
│   ├── server/routes/          # API routes
│   └── server/scripts/         # Database scripts
│
├── 🗄️ Database
│   ├── server/prisma/          # Prisma schema
│   ├── server/database_schema.sql  # SQL schema
│   └── server/sample_data.sql      # Sample data
│
└── 📚 Documentation
    ├── DEPLOYMENT.md           # Deployment guide
    ├── CONTRIBUTING.md         # Contributing guidelines
    └── database_setup.md       # Database setup
```

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/auth/profile     # Get user profile
```

### Projects
```
GET    /api/projects         # List projects
POST   /api/projects         # Create project
GET    /api/projects/:id     # Get project details
PUT    /api/projects/:id     # Update project
DELETE /api/projects/:id     # Delete project
```

### Issues
```
GET    /api/issues           # List issues
POST   /api/issues           # Create issue
GET    /api/issues/:id       # Get issue details
PUT    /api/issues/:id       # Update issue
DELETE /api/issues/:id       # Delete issue
POST   /api/issues/:id/comments  # Add comment
```

### Sprints
```
GET    /api/sprints/:projectId   # List project sprints
POST   /api/sprints              # Create sprint
PUT    /api/sprints/:id          # Update sprint
POST   /api/sprints/:id/issues   # Add issue to sprint
```

## 🎯 Key Features Demo

### Enhanced Board UI
1. Login as developer: `john@example.com` / `john123`
2. Navigate to: http://localhost:3000/projects/1/board
3. Experience:
   - ✅ Drag-and-drop issues between columns
   - ✅ Create, edit, and delete issues
   - ✅ Advanced search and filtering
   - ✅ Sprint management
   - ✅ Beautiful responsive design

### Permission System
- **Developers** can manage issues and sprints
- **Viewers** have read-only access
- **Admins** have full system control
- UI elements show/hide based on permissions

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ..
npm test

# Database reset (if needed)
cd server
npm run db:reset
```

## 🚀 Deployment

### Production Setup
1. **Database**: PostgreSQL (Railway, Supabase, or Neon)
2. **Backend**: Railway, Heroku, or DigitalOcean
3. **Frontend**: Vercel, Netlify, or AWS

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Project Statistics

- **Files**: 246+ files
- **Lines of Code**: 57,000+
- **Languages**: TypeScript, JavaScript, SQL
- **Database Tables**: 25+ tables with relationships
- **API Endpoints**: 50+ RESTful endpoints
- **UI Components**: 100+ reusable components

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by **KARTAVYA Software Server 7.1**
- Built with modern **React** and **Node.js** ecosystem
- Designed for **scalability** and **performance**
- **Community-driven** development approach

---

<div align="center">
  <p><strong>⭐ Star this repository if you find it helpful!</strong></p>
  <p>Built with ❤️ by <a href="https://github.com/rajeev-qa">Rajeev</a></p>
</div>
