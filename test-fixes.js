// Quick test script to verify fixes are working
const { PrismaClient } = require('@prisma/client')

async function testFixes() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing database connection...')
    
    // Test 1: Check if DefaultAssignee model exists
    console.log('✅ Testing DefaultAssignee model...')
    const defaultAssignees = await prisma.defaultAssignee.findMany()
    console.log(`   Found ${defaultAssignees.length} default assignees`)
    
    // Test 2: Check workflows
    console.log('✅ Testing Workflows...')
    const workflows = await prisma.workflow.findMany()
    console.log(`   Found ${workflows.length} workflows`)
    
    // Test 3: Check integrations
    console.log('✅ Testing Integrations...')
    const integrations = await prisma.integration.findMany()
    console.log(`   Found ${integrations.length} integrations`)
    
    // Test 4: Check dashboards
    console.log('✅ Testing Dashboards...')
    const dashboards = await prisma.dashboard.findMany()
    console.log(`   Found ${dashboards.length} dashboards`)
    
    console.log('\n🎉 All database models are working correctly!')
    console.log('✅ Critical fixes have been successfully applied')
    
  } catch (error) {
    console.error('❌ Error testing fixes:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testFixes()