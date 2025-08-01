const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    // Create a viewer role with limited permissions
    const viewerRole = await prisma.role.upsert({
      where: { name: 'viewer' },
      update: {},
      create: {
        name: 'viewer',
        description: 'Read-only access to projects and issues',
        isSystem: false
      }
    })

    // Add limited permissions to viewer role
    const viewerPermissions = [
      'project.view',
      'issue.view', 
      'report.view',
      'user.view'
    ]

    // Clear existing permissions
    await prisma.rolePermission.deleteMany({
      where: { role_id: viewerRole.id }
    })

    // Add new permissions
    for (const permission of viewerPermissions) {
      await prisma.rolePermission.create({
        data: {
          role_id: viewerRole.id,
          permission: permission
        }
      })
    }

    // Create test viewer user
    const hashedPassword = await bcrypt.hash('viewer123', 12)
    
    const viewerUser = await prisma.user.upsert({
      where: { email: 'viewer@kartavya.com' },
      update: {
        role_id: viewerRole.id
      },
      create: {
        username: 'viewer',
        email: 'viewer@kartavya.com',
        password_hash: hashedPassword,
        role_id: viewerRole.id
      }
    })

    // Create a limited developer role
    const limitedDevRole = await prisma.role.upsert({
      where: { name: 'limited-developer' },
      update: {},
      create: {
        name: 'limited-developer',
        description: 'Developer with limited permissions',
        isSystem: false
      }
    })

    // Add limited developer permissions
    const limitedDevPermissions = [
      'project.view',
      'issue.view',
      'issue.create',
      'issue.edit',
      'issue.comment',
      'report.view',
      'test.create',
      'test.execute'
    ]

    // Clear existing permissions
    await prisma.rolePermission.deleteMany({
      where: { role_id: limitedDevRole.id }
    })

    // Add new permissions
    for (const permission of limitedDevPermissions) {
      await prisma.rolePermission.create({
        data: {
          role_id: limitedDevRole.id,
          permission: permission
        }
      })
    }

    // Create test limited developer user
    const limitedDevUser = await prisma.user.upsert({
      where: { email: 'limiteddev@kartavya.com' },
      update: {
        role_id: limitedDevRole.id
      },
      create: {
        username: 'limiteddev',
        email: 'limiteddev@kartavya.com',
        password_hash: hashedPassword,
        role_id: limitedDevRole.id
      }
    })

    console.log('✅ Test users created successfully:')
    console.log(`📧 Viewer: viewer@kartavya.com / viewer123 (${viewerPermissions.length} permissions)`)
    console.log(`📧 Limited Dev: limiteddev@kartavya.com / viewer123 (${limitedDevPermissions.length} permissions)`)
    console.log('\n🔍 Test these accounts to verify permission restrictions work correctly')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()