# Kartavya - Project Management System

A comprehensive JIRA-inspired project management system built with Next.js, Node.js, and PostgreSQL.

## 🚀 Features

- **User Management**: Registration, authentication, roles, and permissions
- **Project Management**: Create, manage, and track projects
- **Issue Tracking**: Create, assign, and track issues with different types and priorities
- **Agile Boards**: Kanban and Scrum boards with drag-and-drop functionality
- **Sprint Management**: Plan, start, and complete sprints
- **Reporting**: Burndown charts, velocity tracking, and analytics
- **Real-time Updates**: Live notifications and updates
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Beautiful DnD** - Drag and drop
- **Axios** - API client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd kartavya
\`\`\`

### 2. Setup Database
\`\`\`bash
# Create PostgreSQL database
createdb c_pms_z

# Or using psql
psql -U postgres
CREATE DATABASE c_pms_z;
\`\`\`

### 3. Backend Setup
\`\`\`bash
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed the database with sample data
npm run db:seed

# Start the backend server
npm run dev
\`\`\`

### 4. Frontend Setup
\`\`\`bash
cd ..  # Back to root directory
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local if needed

# Start the frontend development server
npm run dev
\`\`\`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👥 Demo Accounts

After running the seed script, you can use these demo accounts:

- **Admin**: admin@kartavya.com / admin123
- **Developer**: john@example.com / john123  
- **Developer**: jane@example.com / jane123

## 📁 Project Structure

\`\`\`
kartavya/
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   ├── config/            # Configuration files
│   └── scripts/           # Database scripts
├── prisma/                # Database schema
├── app/                   # Next.js app directory
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── public/               # Static assets
\`\`\`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/comments` - Add comment

### Sprints
- `GET /api/sprints` - Get all sprints
- `POST /api/sprints` - Create sprint
- `GET /api/sprints/:id` - Get sprint details
- `PUT /api/sprints/:id` - Update sprint
- `POST /api/sprints/:id/issues` - Add issue to sprint
- `DELETE /api/sprints/:id/issues/:issue_id` - Remove issue from sprint

## 🧪 Testing

\`\`\`bash
# Backend tests
cd server
npm test

# Frontend tests
cd ..
npm test
\`\`\`

## 🚀 Deployment

### Backend (Heroku)
\`\`\`bash
cd server
heroku create kartavya-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main
\`\`\`

### Frontend (Vercel)
\`\`\`bash
vercel --prod
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by JIRA Software Server 7.1
- Built with modern web technologies
- Designed for scalability and performance
\`\`\`

This is now a complete full-stack Kartavya project management system with:

## ✅ **Complete Implementation:**

1. **Backend API** - Full Node.js/Express server with PostgreSQL
2. **Database Schema** - Complete Prisma schema with all relationships
3. **Authentication** - JWT-based auth with registration/login
4. **Frontend Integration** - React hooks and API client
5. **Real Data** - Connected to actual database with seed data
6. **Error Handling** - Comprehensive error handling and validation
7. **Security** - Password hashing, JWT tokens, CORS protection

## 🚀 **To Run the Complete System:**

1. **Setup Database**: Create PostgreSQL database `c_pms_z`
2. **Backend**: `cd server && npm install && npm run db:push && npm run db:seed && npm run dev`
3. **Frontend**: `npm install && npm run dev`
4. **Access**: Frontend at http://localhost:3000, API at http://localhost:5000

The system now includes real authentication, project management, issue tracking, and sprint functionality with a modern, responsive UI connected to a robust backend API.
