const { Client } = require('pg')
const bcrypt = require('bcrypt')

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kartavya_pms'
  })

  try {
    await client.connect()
    console.log('🌱 Connected to PostgreSQL database')

    // Create roles
    console.log('Creating roles...')
    
    await client.query(`
      INSERT INTO roles (name, description, "isSystem", created_at, updated_at)
      VALUES 
        ('Administrator', 'Full system access with all permissions', true, NOW(), NOW()),
        ('Developer', 'Standard developer access for project work', true, NOW(), NOW()),
        ('Viewer', 'Read-only access to projects and issues', false, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `)
    console.log('✅ Roles created')

    // Get role IDs
    const rolesResult = await client.query('SELECT id, name FROM roles')
    const roles = {}
    rolesResult.rows.forEach(row => {
      roles[row.name] = row.id
    })

    // Create users
    console.log('Creating users...')
    
    const adminPassword = await bcrypt.hash('admin123', 12)
    const johnPassword = await bcrypt.hash('john123', 12)
    const janePassword = await bcrypt.hash('jane123', 12)

    await client.query(`
      INSERT INTO users (username, email, password_hash, role_id, created_at, updated_at)
      VALUES 
        ('admin', 'admin@kartavya.com', $1, $2, NOW(), NOW()),
        ('john_doe', 'john@example.com', $3, $4, NOW(), NOW()),
        ('jane_smith', 'jane@example.com', $5, $6, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [
      adminPassword, roles['Administrator'],
      johnPassword, roles['Developer'], 
      janePassword, roles['Developer']
    ])
    console.log('✅ Users created')

    // Create permissions for roles
    console.log('Creating role permissions...')
    
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
      await client.query(`
        INSERT INTO role_permissions (role_id, permission, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (role_id, permission) DO NOTHING
      `, [roles['Administrator'], permission])
    }

    // Add developer permissions
    for (const permission of developerPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (role_id, permission) DO NOTHING
      `, [roles['Developer'], permission])
    }

    // Add viewer permissions
    for (const permission of viewerPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (role_id, permission) DO NOTHING
      `, [roles['Viewer'], permission])
    }
    
    console.log('✅ Role permissions created')

    // Get user IDs
    const usersResult = await client.query('SELECT id, username FROM users')
    const users = {}
    usersResult.rows.forEach(row => {
      users[row.username] = row.id
    })
    
    console.log('Available users:', users)

    // Create sample project
    console.log('Creating sample project...')
    const johnId = users['john'] || users['john_doe']
    if (!johnId) {
      console.error('John user not found')
      return
    }
    
    await client.query(`
      INSERT INTO projects (name, key, description, lead_user_id, created_at, updated_at)
      VALUES ('E-commerce Platform', 'ECOM', 'Building a modern e-commerce platform with React and Node.js', $1, NOW(), NOW())
      ON CONFLICT (key) DO NOTHING
    `, [johnId])

    // Get project ID
    const projectResult = await client.query('SELECT id FROM projects WHERE key = $1', ['ECOM'])
    const projectId = projectResult.rows[0]?.id

    if (projectId) {
      const janeId = users['jane'] || users['jane_smith']
      
      // Add users to project
      await client.query(`
        INSERT INTO project_users (project_id, user_id, role)
        VALUES 
          ($1, $2, 'lead'),
          ($1, $3, 'developer')
        ON CONFLICT (project_id, user_id) DO NOTHING
      `, [projectId, johnId, janeId])

      // Create sample issues
      console.log('Creating sample issues...')
      await client.query(`
        INSERT INTO issues (project_id, key, summary, description, type, status, priority, assignee_id, reporter_id, story_points, created_at, updated_at)
        VALUES 
          ($1, 'ECOM-1', 'Implement user authentication', 'Create login and registration functionality with JWT tokens', 'story', 'To Do', 'High', $2, $2, 8, NOW(), NOW()),
          ($1, 'ECOM-2', 'Design product catalog page', 'Create responsive product listing with filters and search', 'task', 'In Progress', 'Medium', $3, $2, 5, NOW(), NOW()),
          ($1, 'ECOM-3', 'Fix payment gateway bug', 'Payment processing fails for certain card types', 'bug', 'To Do', 'High', $2, $3, NULL, NOW(), NOW()),
          ($1, 'ECOM-4', 'Setup project structure', 'Initialize React app with routing and state management', 'task', 'Done', 'Medium', $3, $2, 3, NOW(), NOW())
        ON CONFLICT (key) DO NOTHING
      `, [projectId, johnId, janeId])

      // Create sample sprint
      console.log('Creating sample sprint...')
      const sprintResult = await client.query(`
        INSERT INTO sprints (project_id, name, start_date, end_date, status, created_at)
        VALUES ($1, 'Sprint 1 - Foundation', '2024-01-15', '2024-01-29', 'active', NOW())
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [projectId])
      
      if (sprintResult.rows.length > 0) {
        const sprintId = sprintResult.rows[0].id
        
        // Add issues to sprint
        const issuesResult = await client.query(`
          SELECT id FROM issues WHERE project_id = $1 AND key IN ('ECOM-1', 'ECOM-2', 'ECOM-3')
        `, [projectId])
        
        for (const issue of issuesResult.rows) {
          await client.query(`
            INSERT INTO sprint_issues (sprint_id, issue_id)
            VALUES ($1, $2)
            ON CONFLICT (sprint_id, issue_id) DO NOTHING
          `, [sprintId, issue.id])
        }
      }

      console.log('✅ Sample data created')
    } else {
      console.log('⚠️ Project not created, skipping sample data')
    }

    console.log('✅ Database seeded successfully!')
    console.log('👤 Admin user: admin@kartavya.com / admin123')
    console.log('👤 John Doe: john@example.com / john123')
    console.log('👤 Jane Smith: jane@example.com / jane123')
    console.log('🔐 Permissions configured for all roles')
    console.log('📋 Sample project and issues created')
    console.log('🎆 Ready to test at http://localhost:3001/projects/1/board')

  } catch (error) {
    console.error('❌ Seed failed:', error)
  } finally {
    await client.end()
  }
}

main()