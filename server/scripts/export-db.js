const { exec } = require('child_process')
const path = require('path')

// Database export script
async function exportDatabase() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kartavya_pms'
  const outputFile = path.join(__dirname, '..', 'database_dump.sql')
  
  console.log('🗄️  Exporting database...')
  
  // Extract connection details from DATABASE_URL
  const url = new URL(dbUrl)
  const host = url.hostname
  const port = url.port || 5432
  const database = url.pathname.slice(1)
  const username = url.username
  const password = url.password
  
  // Set PGPASSWORD environment variable
  process.env.PGPASSWORD = password
  
  const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password > "${outputFile}"`
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Export failed:', error.message)
      console.log('💡 Alternative: Use pgAdmin or manual export')
      console.log('   1. Open pgAdmin')
      console.log('   2. Right-click database -> Backup...')
      console.log('   3. Choose "Plain" format')
      console.log('   4. Save as database_dump.sql')
      return
    }
    
    if (stderr) {
      console.warn('⚠️  Warnings:', stderr)
    }
    
    console.log('✅ Database exported successfully!')
    console.log(`📁 File saved: ${outputFile}`)
  })
}

// Run export if called directly
if (require.main === module) {
  exportDatabase()
}

module.exports = { exportDatabase }