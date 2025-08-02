const { Pool } = require('pg');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pwxAAaEeuJWigKlTOmjEUlSohlxQMMIB@postgres.railway.internal:5432/railway';
  
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Setting up database...');
    
    // Read and execute the database schema
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'server', 'database_schema.sql');
    const sampleDataPath = path.join(__dirname, 'server', 'sample_data.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('Database schema created successfully');
    }
    
    if (fs.existsSync(sampleDataPath)) {
      const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
      await pool.query(sampleData);
      console.log('Sample data inserted successfully');
    }
    
    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;