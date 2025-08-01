const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role',
      isSystem: true
    }
  })

  // Create developer role
  const devRole = await prisma.role.upsert({
    where: { name: 'developer' },
    update: {},
    create: {
      name: 'developer',
      description: 'Developer role',
      isSystem: true
    }
  })

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kartavya.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@kartavya.com',
      password_hash: adminPassword,
      role_id: adminRole.id
    }
  })

  // Create developer users
  const johnPassword = await bcrypt.hash('john123', 10)
  const johnUser = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      username: 'john',
      email: 'john@example.com',
      password_hash: johnPassword,
      role_id: devRole.id
    }
  })

  const janePassword = await bcrypt.hash('jane123', 10)
  const janeUser = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      username: 'jane',
      email: 'jane@example.com',
      password_hash: janePassword,
      role_id: devRole.id
    }
  })

  console.log('Demo users created:')
  console.log('Admin: admin@kartavya.com / admin123')
  console.log('Developer: john@example.com / john123')
  console.log('Developer: jane@example.com / jane123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })