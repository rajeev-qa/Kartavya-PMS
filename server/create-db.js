const { Client } = require('pg')

async function createDatabase() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
  })

  try {
    await client.connect()
    await client.query('CREATE DATABASE kartavya_pms')
    console.log('✅ Database kartavya_pms created successfully')
  } catch (error) {
    if (error.code === '42P04') {
      console.log('✅ Database kartavya_pms already exists')
    } else {
      console.error('❌ Error creating database:', error.message)
    }
  } finally {
    await client.end()
  }
}

createDatabase()