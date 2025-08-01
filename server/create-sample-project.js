const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@kartavya.com' }
  })

  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  // Create sample project
  const project = await prisma.project.upsert({
    where: { key: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Project',
      key: 'DEMO',
      description: 'Sample project for testing',
      lead_user_id: adminUser.id
    }
  })

  // Add admin user to project
  await prisma.projectUser.upsert({
    where: {
      project_id_user_id: {
        project_id: project.id,
        user_id: adminUser.id
      }
    },
    update: {},
    create: {
      project_id: project.id,
      user_id: adminUser.id,
      role: 'lead'
    }
  })

  console.log('Sample project created:', project.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })