const prisma = require("./config/database")

async function testAuth() {
  try {
    console.log("Testing database connection...")
    
    // Test finding a user without relations first
    const user = await prisma.user.findFirst()
    console.log("User found:", user)
    
    // Test roles table
    const roles = await prisma.role.findMany()
    console.log("Roles:", roles)
    
  } catch (error) {
    console.error("Test error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()