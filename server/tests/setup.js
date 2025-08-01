const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test_db",
    },
  },
})

const beforeAll = async () => {
  // Setup test database
  await prisma.$connect()
}

const afterAll = async () => {
  // Cleanup test database
  await prisma.$disconnect()
}

const beforeEach = async () => {
  // Clean up data before each test
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `

  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
      } catch (error) {
        console.log({ error })
      }
    }
  }
}

module.exports = { prisma, beforeAll, afterAll, beforeEach }
