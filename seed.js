const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@kartavya.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@kartavya.com",
      password_hash: adminPassword,
      role: "admin",
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
      role: "developer",
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
      role: "developer",
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

  console.log("✅ Database seeded successfully!")
  console.log("👤 Admin user: admin@kartavya.com / admin123")
  console.log("👤 John Doe: john@example.com / john123")
  console.log("👤 Jane Smith: jane@example.com / jane123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })