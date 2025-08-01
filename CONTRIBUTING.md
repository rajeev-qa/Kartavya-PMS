# Contributing to Kartavya PMS

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/Kartavya-PMS.git
   cd Kartavya-PMS
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ..
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb kartavya_pms
   
   # Setup environment
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Initialize database
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd server
   npm run dev
   
   # Frontend (Terminal 2)
   cd ..
   npm run dev
   ```

## Development Guidelines

### Code Style
- Use TypeScript for new frontend code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Database Changes
- Always use Prisma migrations
- Update seed data if needed
- Test migrations locally first

### API Development
- Follow RESTful conventions
- Add proper error handling
- Include input validation
- Add permission checks

### Frontend Development
- Use Next.js app router
- Implement responsive design
- Add proper loading states
- Handle errors gracefully

## Testing

### Backend Tests
```bash
cd server
npm test
npm run test:watch
```

### Frontend Tests
```bash
npm test
npm run test:watch
```

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests for new features
   - Update documentation

3. **Test Changes**
   ```bash
   # Run all tests
   npm test
   
   # Test database changes
   npm run db:reset
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Database changes tested
- [ ] No breaking changes (or documented)

## Issue Reporting

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
Include:
- Clear description
- Use case/motivation
- Proposed solution
- Alternative solutions considered

## Development Tips

### Database Management
```bash
# Reset database
npm run db:reset

# Export database
npm run db:export

# View database
npx prisma studio
```

### Debugging
- Use browser dev tools
- Check server logs
- Use Prisma Studio for database inspection
- Enable debug mode in .env

### Common Issues
1. **Port conflicts**: Change ports in .env files
2. **Database connection**: Verify PostgreSQL is running
3. **Permission errors**: Check user roles and permissions
4. **Build errors**: Clear node_modules and reinstall

## Architecture Overview

### Backend Structure
```
server/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/         # API routes
├── config/         # Configuration files
├── scripts/        # Database scripts
└── prisma/         # Database schema
```

### Frontend Structure
```
app/                # Next.js app router
components/         # Reusable components
hooks/             # Custom React hooks
lib/               # Utility functions
public/            # Static assets
```

### Key Technologies
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: JWT tokens
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui components

## Release Process

1. **Version Bump**
   ```bash
   npm version patch|minor|major
   ```

2. **Update Changelog**
   - Document new features
   - List bug fixes
   - Note breaking changes

3. **Create Release**
   - Tag version in Git
   - Create GitHub release
   - Deploy to production

## Support

- **Documentation**: Check README.md and docs/
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.