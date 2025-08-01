const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  })

  // Get developer role
  const devRole = await prisma.role.findUnique({
    where: { name: 'developer' }
  })

  if (!adminRole || !devRole) {
    console.error('Roles not found')
    return
  }

  // Admin permissions - Full access
  const adminPermissions = [
    // Project Management
    'project.create', 'project.edit', 'project.delete', 'project.view', 'project.archive', 'project.lead', 'project.components', 'project.versions', 'project.settings',
    // Issue Management
    'issue.create', 'issue.edit', 'issue.delete', 'issue.assign', 'issue.comment', 'issue.transition', 'issue.link', 'issue.watch', 'issue.vote', 'issue.attachments', 'issue.worklog', 'issue.clone', 'issue.move', 'issue.bulk_edit',
    // User Management
    'user.create', 'user.edit', 'user.delete', 'user.view', 'user.deactivate', 'user.reset_password', 'user.assign_roles', 'user.manage_groups', 'user.impersonate', 'user.view_activity', 'user.manage_permissions',
    // Team Management
    'team.create', 'team.edit', 'team.delete', 'team.add_members', 'team.remove_members', 'team.assign_lead',
    // Administration
    'admin.settings', 'admin.roles', 'admin.permissions', 'admin.audit_logs', 'admin.backup', 'admin.maintenance', 'admin.integrations', 'admin.notifications',
    // Reporting & Analytics
    'report.view', 'report.create', 'report.export', 'report.share', 'report.schedule', 'report.dashboard',
    // Board Management
    'board.create', 'board.edit', 'board.delete', 'board.configure', 'board.filters', 'board.swimlanes',
    // Sprint Management
    'sprint.create', 'sprint.edit', 'sprint.start', 'sprint.complete', 'sprint.delete', 'sprint.plan',
    // Workflow Management
    'workflow.create', 'workflow.edit', 'workflow.delete', 'workflow.assign',
    // Search & Filters
    'search.advanced', 'search.save_filters', 'search.share_filters',
    // Test Management
    'test.create', 'test.execute', 'test.manage', 'test.report'
  ]

  // Developer permissions - Project and development focused
  const devPermissions = [
    // Project Management
    'project.view', 'project.components', 'project.versions',
    // Issue Management
    'issue.create', 'issue.edit', 'issue.assign', 'issue.comment', 'issue.transition', 'issue.link', 'issue.watch', 'issue.vote', 'issue.attachments', 'issue.worklog', 'issue.clone',
    // User Management (limited)
    'user.view',
    // Reporting & Analytics
    'report.view', 'report.create', 'report.export',
    // Board Management
    'board.edit', 'board.filters',
    // Sprint Management
    'sprint.edit', 'sprint.plan',
    // Search & Filters
    'search.advanced', 'search.save_filters',
    // Test Management
    'test.create', 'test.execute', 'test.report'
  ]

  // Add admin permissions
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission: {
          role_id: adminRole.id,
          permission: permission
        }
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission: permission
      }
    })
  }

  // Add developer permissions
  for (const permission of devPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission: {
          role_id: devRole.id,
          permission: permission
        }
      },
      update: {},
      create: {
        role_id: devRole.id,
        permission: permission
      }
    })
  }

  console.log('Permissions added successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })