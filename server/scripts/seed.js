const prisma = require("../config/database")
const bcrypt = require("bcrypt")

async function main() {
  console.log("🌱 Starting database seed...")

  // Create roles first
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: {
      name: "Administrator",
      description: "Full system access with all permissions",
      isSystem: true
    }
  })

  const developerRole = await prisma.role.upsert({
    where: { name: "Developer" },
    update: {},
    create: {
      name: "Developer",
      description: "Standard developer access for project work",
      isSystem: true
    }
  })

  const viewerRole = await prisma.role.upsert({
    where: { name: "Viewer" },
    update: {},
    create: {
      name: "Viewer",
      description: "Read-only access to projects and issues",
      isSystem: false
    }
  })

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@kartavya.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@kartavya.com",
      password_hash: adminPassword,
      role_id: adminRole.id,
    },
  })

  // Create regular users
  const johnPassword = await bcrypt.hash("john123", 12)
  const john = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      username: "john_doe",
      email: "john@example.com",
      password_hash: johnPassword,
      role_id: developerRole.id,
    },
  })

  const janePassword = await bcrypt.hash("jane123", 12)
  const jane = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      username: "jane_smith",
      email: "jane@example.com",
      password_hash: janePassword,
      role_id: developerRole.id,
    },
  })

  // Create sample project
  const project = await prisma.project.upsert({
    where: { key: "ECOM" },
    update: {},
    create: {
      name: "E-commerce Platform",
      key: "ECOM",
      description: "Building a modern e-commerce platform with React and Node.js",
      lead_user_id: john.id,
    },
  })

  // Add users to project
  await prisma.projectUser.upsert({
    where: {
      project_id_user_id: {
        project_id: project.id,
        user_id: john.id,
      },
    },
    update: {},
    create: {
      project_id: project.id,
      user_id: john.id,
      role: "lead",
    },
  })

  await prisma.projectUser.upsert({
    where: {
      project_id_user_id: {
        project_id: project.id,
        user_id: jane.id,
      },
    },
    update: {},
    create: {
      project_id: project.id,
      user_id: jane.id,
      role: "developer",
    },
  })

  // Create sample issues
  const issues = [
    {
      key: "ECOM-1",
      summary: "Implement user authentication",
      description: "Create login and registration functionality with JWT tokens",
      type: "story",
      status: "To Do",
      priority: "High",
      assignee_id: john.id,
      reporter_id: john.id,
      story_points: 8,
    },
    {
      key: "ECOM-2",
      summary: "Design product catalog page",
      description: "Create responsive product listing with filters and search",
      type: "task",
      status: "In Progress",
      priority: "Medium",
      assignee_id: jane.id,
      reporter_id: john.id,
      story_points: 5,
    },
    {
      key: "ECOM-3",
      summary: "Fix payment gateway bug",
      description: "Payment processing fails for certain card types",
      type: "bug",
      status: "To Do",
      priority: "High",
      assignee_id: john.id,
      reporter_id: jane.id,
    },
    {
      key: "ECOM-4",
      summary: "Setup project structure",
      description: "Initialize React app with routing and state management",
      type: "task",
      status: "Done",
      priority: "Medium",
      assignee_id: jane.id,
      reporter_id: john.id,
      story_points: 3,
    },
  ]

  for (const issueData of issues) {
    await prisma.issue.upsert({
      where: { key: issueData.key },
      update: {},
      create: {
        ...issueData,
        project_id: project.id,
      },
    })
  }

  // Create sample sprint
  const sprint = await prisma.sprint.upsert({
    where: { id: 1 },
    update: {},
    create: {
      project_id: project.id,
      name: "Sprint 1 - Foundation",
      start_date: new Date("2024-01-15"),
      end_date: new Date("2024-01-29"),
      status: "Active",
    },
  })

  // Add issues to sprint
  const sprintIssues = await prisma.issue.findMany({
    where: {
      project_id: project.id,
      key: { in: ["ECOM-1", "ECOM-2", "ECOM-3"] },
    },
  })

  for (const issue of sprintIssues) {
    await prisma.sprintIssue.upsert({
      where: {
        sprint_id_issue_id: {
          sprint_id: sprint.id,
          issue_id: issue.id,
        },
      },
      update: {},
      create: {
        sprint_id: sprint.id,
        issue_id: issue.id,
      },
    })
  }

  // Create permissions for roles
  const adminPermissions = [
    'project.view', 'project.create', 'project.edit', 'project.delete',
    'issue.view', 'issue.create', 'issue.edit', 'issue.delete',
    'user.view', 'user.create', 'user.edit', 'user.delete',
    'admin.settings', 'admin.roles', 'admin.permissions',
    'report.view', 'report.create', 'sprint.view', 'sprint.create', 'sprint.edit', 'sprint.delete'
  ]

  const developerPermissions = [
    'project.view', 'issue.view', 'issue.create', 'issue.edit', 'issue.delete',
    'report.view', 'sprint.view', 'sprint.create', 'sprint.edit'
  ]

  const viewerPermissions = [
    'project.view', 'issue.view', 'report.view', 'sprint.view'
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
  for (const permission of developerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission: {
          role_id: developerRole.id,
          permission: permission
        }
      },
      update: {},
      create: {
        role_id: developerRole.id,
        permission: permission
      }
    })
  }

  // Add viewer permissions
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission: {
          role_id: viewerRole.id,
          permission: permission
        }
      },
      update: {},
      create: {
        role_id: viewerRole.id,
        permission: permission
      }
    })
  }

  console.log("✅ Database seeded successfully!")
  console.log("👤 Admin user: admin@kartavya.com / admin123")
  console.log("👤 John Doe: john@example.com / john123")
  console.log("👤 Jane Smith: jane@example.com / jane123")
  console.log("🔐 Permissions configured for all roles")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
