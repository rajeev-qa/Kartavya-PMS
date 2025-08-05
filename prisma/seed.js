const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create roles first
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Full system access',
      isSystem: true
    }
  })

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kartavya.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@kartavya.com',
      password_hash: 'admin123', // Simple password for demo
      role_id: adminRole.id
    }
  })

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { key: 'KPM' },
    update: {},
    create: {
      name: 'Kartavya PMS',
      key: 'KPM',
      description: 'Main project management system',
      lead_user_id: adminUser.id
    }
  })

  const project2 = await prisma.project.upsert({
    where: { key: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Project',
      key: 'DEMO',
      description: 'Demo project for testing',
      lead_user_id: adminUser.id
    }
  })

  // Create sample issues
  await prisma.issue.createMany({
    data: [
      {
        key: 'KPM-1',
        summary: 'Setup project structure',
        description: 'Initialize the basic project structure with necessary folders and files',
        type: 'Task',
        status: 'Done',
        priority: 'High',
        assignee_id: adminUser.id,
        reporter_id: adminUser.id,
        project_id: project1.id
      },
      {
        key: 'KPM-2',
        summary: 'Implement user authentication',
        description: 'Add login and registration functionality',
        type: 'Story',
        status: 'In Progress',
        priority: 'High',
        assignee_id: adminUser.id,
        reporter_id: adminUser.id,
        project_id: project1.id
      },
      {
        key: 'DEMO-1',
        summary: 'Create demo data',
        description: 'Add sample data for demonstration',
        type: 'Task',
        status: 'To Do',
        priority: 'Medium',
        assignee_id: adminUser.id,
        reporter_id: adminUser.id,
        project_id: project2.id
      }
    ],
    skipDuplicates: true
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })