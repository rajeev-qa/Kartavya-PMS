# GitHub Repository Setup Guide

## 🚀 Quick Setup

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Repository name: `Kartavya-PMS`
4. Description: `A comprehensive JIRA-inspired project management system built with Next.js, Node.js, and PostgreSQL`
5. Set to Public or Private
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### 2. Push to GitHub
```bash
# Navigate to project directory
cd kartavya-pms

# Add your GitHub repository as remote (replace 'yourusername' with your GitHub username)
git remote set-url origin https://github.com/yourusername/Kartavya-PMS.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Repository Structure
Your repository will include:
```
Kartavya-PMS/
├── 📁 app/                    # Next.js frontend
├── 📁 server/                 # Node.js backend
├── 📁 components/             # React components
├── 📁 lib/                    # Utility libraries
├── 📁 hooks/                  # Custom React hooks
├── 📄 README.md               # Project documentation
├── 📄 DEPLOYMENT.md           # Deployment guide
├── 📄 CONTRIBUTING.md         # Contributing guidelines
├── 📄 database_setup.md       # Database setup guide
├── 📄 .gitignore             # Git ignore rules
├── 📄 package.json           # Frontend dependencies
└── 📁 server/
    ├── 📄 package.json       # Backend dependencies
    ├── 📄 .env.example       # Environment template
    └── 📁 scripts/
        └── 📄 sql-seed.js    # Database seeding
```

## 🗄️ Database Export

### Option 1: Manual Export (Recommended)
1. Open pgAdmin or your PostgreSQL client
2. Right-click on `kartavya_pms` database
3. Select "Backup..."
4. Choose "Plain" format
5. Save as `database_dump.sql` in project root

### Option 2: Command Line Export
```bash
# Navigate to server directory
cd server

# Run export script
npm run db:export

# Or manually with pg_dump
pg_dump -h localhost -U postgres -d kartavya_pms > database_dump.sql
```

### Option 3: Schema Only Export
```bash
# Export schema without data
pg_dump -h localhost -U postgres -d kartavya_pms --schema-only > schema_dump.sql

# Export data only
pg_dump -h localhost -U postgres -d kartavya_pms --data-only > data_dump.sql
```

## 📋 Repository Features

### ✅ What's Included
- **Complete Full-Stack Application**
  - Next.js 14 frontend with TypeScript
  - Node.js/Express backend with Prisma ORM
  - PostgreSQL database with complete schema
  - JWT authentication with role-based permissions

- **Enhanced Board UI**
  - Beautiful Kanban/Scrum boards with drag-and-drop
  - Permission-based UI controls
  - Real-time updates and notifications
  - Responsive design for all devices

- **Permission System**
  - Role-based access control (Admin, Developer, Viewer)
  - Granular permissions for all operations
  - Frontend and backend permission checks
  - Secure API endpoints

- **Sample Data**
  - Pre-configured roles and permissions
  - Sample project with issues and sprints
  - Demo user accounts for testing
  - Complete database seed scripts

- **Documentation**
  - Comprehensive setup guides
  - Deployment instructions
  - API documentation
  - Contributing guidelines

### 🔧 Configuration Files
- **Environment Templates**: `.env.example` files for easy setup
- **Docker Support**: Dockerfile and docker-compose.yml
- **CI/CD**: GitHub Actions workflow
- **Database**: Prisma schema and migration scripts
- **Testing**: Jest configuration and test files

## 🚀 Quick Start for Contributors

### Clone and Setup
```bash
# Clone repository
git clone https://github.com/yourusername/Kartavya-PMS.git
cd Kartavya-PMS

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run db:seed

# Setup frontend
cd ..
npm install

# Start development servers
npm run dev        # Frontend (Terminal 1)
cd server && npm run dev  # Backend (Terminal 2)
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Enhanced Board**: http://localhost:3000/projects/1/board

### Demo Accounts
- **Admin**: admin@kartavya.com / admin123
- **Developer**: john@example.com / john123
- **Developer**: jane@example.com / jane123

## 📊 Project Statistics

### Codebase Size
- **Total Files**: 246 files
- **Lines of Code**: 57,000+ lines
- **Languages**: TypeScript, JavaScript, SQL, CSS
- **Frameworks**: Next.js, Express.js, Prisma

### Features Implemented
- ✅ User Authentication & Authorization
- ✅ Project Management
- ✅ Issue Tracking (Stories, Tasks, Bugs, Epics)
- ✅ Agile Boards (Kanban & Scrum)
- ✅ Sprint Management
- ✅ Role-Based Permissions
- ✅ Real-time Updates
- ✅ Responsive Design
- ✅ Database Seeding
- ✅ API Documentation

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test**
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Create Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by JIRA Software Server 7.1
- Built with modern web technologies
- Designed for scalability and performance
- Community-driven development

---

**Ready to push to GitHub!** 🎉

Replace `yourusername` with your actual GitHub username in the remote URL and you're all set!