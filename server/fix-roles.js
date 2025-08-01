const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createRoles() {
  try {
    // Create roles if they don't exist
    const rolesList = [
      { id: 1, name: 'admin', description: 'Administrator', updated_at: new Date() },
      { id: 2, name: 'manager', description: 'Project Manager', updated_at: new Date() },
      { id: 3, name: 'developer', description: 'Developer', updated_at: new Date() }
    ]

    for (const role of rolesList) {
      await prisma.roles.upsert({
        where: { id: role.id },
        update: { updated_at: new Date() },
        create: role
      })
    }

    console.log('✅ Roles created successfully')
  } catch (error) {
    console.error('❌ Error creating roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRoles()