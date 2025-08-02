const { Pool } = require('pg');

async function testConnection() {
  // Use PUBLIC URL for external testing
  const pool = new Pool({
    connectionString: 'postgresql://postgres:pwxAAaEeuJWigKlTOmjEUlSohlxQMMIB@centerbeam.proxy.rlwy.net:33078/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Testing Railway database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].now);
    
    // Test if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();