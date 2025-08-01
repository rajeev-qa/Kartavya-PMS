const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
  console.log('🌱 Starting simple database seed...');
  
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const johnPassword = await bcrypt.hash('john123', 12);
    const janePassword = await bcrypt.hash('jane123', 12);
    
    // Insert users
    db.run(`INSERT OR REPLACE INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES 
      (1, 'admin', 'admin@kartavya.com', ?, 'admin', datetime('now'), datetime('now')),
      (2, 'john_doe', 'john@example.com', ?, 'developer', datetime('now'), datetime('now')),
      (3, 'jane_smith', 'jane@example.com', ?, 'developer', datetime('now'), datetime('now'))
    `, [adminPassword, johnPassword, janePassword]);
    
    // Insert project
    db.run(`INSERT OR REPLACE INTO projects (id, name, key, description, lead_user_id, created_at, updated_at) VALUES 
      (1, 'E-commerce Platform', 'ECOM', 'Building a modern e-commerce platform', 2, datetime('now'), datetime('now'))
    `);
    
    // Insert issues
    db.run(`INSERT OR REPLACE INTO issues (id, project_id, key, summary, description, type, status, priority, assignee_id, reporter_id, story_points, created_at, updated_at) VALUES 
      (1, 1, 'ECOM-1', 'Implement user authentication', 'Create login and registration functionality', 'story', 'To Do', 'High', 2, 2, 8, datetime('now'), datetime('now')),
      (2, 1, 'ECOM-2', 'Design product catalog', 'Create responsive product listing', 'task', 'In Progress', 'Medium', 3, 2, 5, datetime('now'), datetime('now')),
      (3, 1, 'ECOM-3', 'Fix payment gateway bug', 'Payment processing fails', 'bug', 'To Do', 'High', 2, 3, NULL, datetime('now'), datetime('now'))
    `);
    
    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin: admin@kartavya.com / admin123');
    console.log('👤 John: john@example.com / john123');
    console.log('👤 Jane: jane@example.com / jane123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    db.close();
  }
}

seed();