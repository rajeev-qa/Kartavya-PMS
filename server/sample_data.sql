-- Kartavya PMS Sample Data
-- Run this after creating the schema

-- Insert roles
INSERT INTO roles (name, description, "isSystem", created_at, updated_at) VALUES
('Administrator', 'Full system access with all permissions', true, NOW(), NOW()),
('Developer', 'Standard developer access for project work', true, NOW(), NOW()),
('Viewer', 'Read-only access to projects and issues', false, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert users (passwords are hashed with bcrypt)
-- admin123, john123, jane123
INSERT INTO users (username, email, password_hash, role_id, created_at, updated_at) VALUES
('admin', 'admin@kartavya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.LBHyuu', 1, NOW(), NOW()),
('john', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.LBHyuu', 2, NOW(), NOW()),
('jane', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.LBHyuu', 2, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert role permissions
INSERT INTO role_permissions (role_id, permission, created_at) VALUES
-- Administrator permissions
(1, 'project.view', NOW()),
(1, 'project.create', NOW()),
(1, 'project.edit', NOW()),
(1, 'project.delete', NOW()),
(1, 'issue.view', NOW()),
(1, 'issue.create', NOW()),
(1, 'issue.edit', NOW()),
(1, 'issue.delete', NOW()),
(1, 'user.view', NOW()),
(1, 'user.create', NOW()),
(1, 'user.edit', NOW()),
(1, 'user.delete', NOW()),
(1, 'admin.settings', NOW()),
(1, 'admin.roles', NOW()),
(1, 'admin.permissions', NOW()),
(1, 'report.view', NOW()),
(1, 'report.create', NOW()),
(1, 'sprint.view', NOW()),
(1, 'sprint.create', NOW()),
(1, 'sprint.edit', NOW()),
(1, 'sprint.delete', NOW()),

-- Developer permissions
(2, 'project.view', NOW()),
(2, 'issue.view', NOW()),
(2, 'issue.create', NOW()),
(2, 'issue.edit', NOW()),
(2, 'issue.delete', NOW()),
(2, 'report.view', NOW()),
(2, 'sprint.view', NOW()),
(2, 'sprint.create', NOW()),
(2, 'sprint.edit', NOW()),

-- Viewer permissions
(3, 'project.view', NOW()),
(3, 'issue.view', NOW()),
(3, 'report.view', NOW()),
(3, 'sprint.view', NOW())
ON CONFLICT (role_id, permission) DO NOTHING;

-- Insert sample project
INSERT INTO projects (name, key, description, lead_user_id, created_at, updated_at) VALUES
('E-commerce Platform', 'ECOM', 'Building a modern e-commerce platform with React and Node.js', 2, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Insert project users
INSERT INTO project_users (project_id, user_id, role) VALUES
(1, 2, 'lead'),
(1, 3, 'developer')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample issues
INSERT INTO issues (project_id, key, summary, description, type, status, priority, assignee_id, reporter_id, story_points, created_at, updated_at) VALUES
(1, 'ECOM-1', 'Implement user authentication', 'Create login and registration functionality with JWT tokens', 'story', 'To Do', 'High', 2, 2, 8, NOW(), NOW()),
(1, 'ECOM-2', 'Design product catalog page', 'Create responsive product listing with filters and search', 'task', 'In Progress', 'Medium', 3, 2, 5, NOW(), NOW()),
(1, 'ECOM-3', 'Fix payment gateway bug', 'Payment processing fails for certain card types', 'bug', 'To Do', 'High', 2, 3, NULL, NOW(), NOW()),
(1, 'ECOM-4', 'Setup project structure', 'Initialize React app with routing and state management', 'task', 'Done', 'Medium', 3, 2, 3, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Insert sample sprint
INSERT INTO sprints (project_id, name, start_date, end_date, status, created_at) VALUES
(1, 'Sprint 1 - Foundation', '2024-01-15', '2024-01-29', 'active', NOW())
ON CONFLICT DO NOTHING;

-- Insert sprint issues
INSERT INTO sprint_issues (sprint_id, issue_id) VALUES
(1, 1),
(1, 2),
(1, 3)
ON CONFLICT (sprint_id, issue_id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (issue_id, user_id, content, created_at, updated_at) VALUES
(1, 2, 'Started working on the authentication system. Planning to use JWT tokens for session management.', NOW(), NOW()),
(2, 3, 'Created initial wireframes for the product catalog. Will implement responsive grid layout.', NOW(), NOW()),
(3, 2, 'Investigating the payment gateway issue. Seems to be related to card validation.', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample work logs
INSERT INTO work_logs (issue_id, user_id, time_spent, comment, created_at) VALUES
(1, 2, 240, 'Set up authentication middleware and JWT token generation', NOW()),
(2, 3, 180, 'Designed product card component and grid layout', NOW()),
(3, 2, 120, 'Debugged payment validation logic', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample test cases
INSERT INTO test_cases (title, description, steps, expected_result, project_id, issue_id, priority, status, created_by, created_at, updated_at) VALUES
('User Login Test', 'Test user authentication functionality', 
 '[{"step": 1, "action": "Navigate to login page"}, {"step": 2, "action": "Enter valid credentials"}, {"step": 3, "action": "Click login button"}]',
 'User should be successfully logged in and redirected to dashboard', 1, 1, 'High', 'Active', 2, NOW(), NOW()),
('Product Search Test', 'Test product search functionality',
 '[{"step": 1, "action": "Navigate to product catalog"}, {"step": 2, "action": "Enter search term"}, {"step": 3, "action": "Press enter or click search"}]',
 'Relevant products should be displayed in search results', 1, 2, 'Medium', 'Active', 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample versions
INSERT INTO versions (project_id, name, description, release_date, created_at) VALUES
(1, 'v1.0.0', 'Initial release with core functionality', '2024-03-01', NOW()),
(1, 'v1.1.0', 'Feature update with enhanced UI', '2024-04-01', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample components
INSERT INTO components (project_id, name, description, lead_user_id, created_at) VALUES
(1, 'Authentication', 'User login and registration system', 2, NOW()),
(1, 'Product Catalog', 'Product listing and search functionality', 3, NOW()),
(1, 'Payment Gateway', 'Payment processing and validation', 2, NOW())
ON CONFLICT DO NOTHING;