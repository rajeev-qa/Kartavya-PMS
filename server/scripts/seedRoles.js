const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: [
      'project.create', 'project.edit', 'project.delete', 'project.view',
      'issue.create', 'issue.edit', 'issue.delete', 'issue.assign', 'issue.comment',
      'user.create', 'user.edit', 'user.delete', 'user.view',
      'admin.settings', 'admin.roles', 'admin.permissions',
      'report.view', 'report.create', 'report.export',
      'board.create', 'board.edit', 'board.delete',
      'sprint.create', 'sprint.edit', 'sprint.start', 'sprint.complete'
    ]
  },
  {
    name: 'Project Manager',
    description: 'Manage projects, issues, and team members',
    isSystem: false,
    permissions: [
      'project.create', 'project.edit', 'project.view',
      'issue.create', 'issue.edit', 'issue.assign', 'issue.comment',
      'user.view', 'report.view', 'report.create',
      'board.create', 'board.edit',
      'sprint.create', 'sprint.edit', 'sprint.start', 'sprint.complete'
    ]
  },
  {
    name: 'Developer',
    description: 'Work on issues and view project information',
    isSystem: false,
    permissions: [
      'project.view',
      'issue.create', 'issue.edit', 'issue.comment',
      'user.view',
      'board.edit',
      'report.view'
    ]
  },
  {
    name: 'Viewer',
    description: 'Read-only access to projects and issues',
    isSystem: false,
    permissions: [
      'project.view',
      'issue.view',
      'user.view',
      'report.view'
    ]
  }
];

async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...');

    for (const roleData of DEFAULT_ROLES) {
      const { permissions, ...roleInfo } = roleData;

      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: { name: roleInfo.name }
      });

      if (existingRole) {
        console.log(`⏭️  Role "${roleInfo.name}" already exists, skipping...`);
        continue;
      }

      // Create role with permissions
      const role = await prisma.role.create({
        data: {
          ...roleInfo,
          permissions: {
            create: permissions.map(permission => ({
              permission
            }))
          }
        },
        include: {
          permissions: true
        }
      });

      console.log(`✅ Created role: ${role.name} with ${role.permissions.length} permissions`);
    }

    console.log('🎉 Role seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedRoles()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedRoles };