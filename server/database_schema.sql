-- Kartavya PMS Database Schema
-- Generated for GitHub repository

-- Create database (run this first)
-- CREATE DATABASE kartavya_pms;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "isSystem" BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    permission VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    lead_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project users table
CREATE TABLE IF NOT EXISTS project_users (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    key VARCHAR(50) UNIQUE NOT NULL,
    summary VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50),
    assignee_id INTEGER,
    reporter_id INTEGER NOT NULL,
    epic_id INTEGER,
    story_points INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP
);

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sprint issues table
CREATE TABLE IF NOT EXISTS sprint_issues (
    sprint_id INTEGER NOT NULL,
    issue_id INTEGER NOT NULL,
    PRIMARY KEY (sprint_id, issue_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Work logs table
CREATE TABLE IF NOT EXISTS work_logs (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    release_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue versions table
CREATE TABLE IF NOT EXISTS issue_versions (
    issue_id INTEGER NOT NULL,
    version_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    PRIMARY KEY (issue_id, version_id, type)
);

-- Components table
CREATE TABLE IF NOT EXISTS components (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue components table
CREATE TABLE IF NOT EXISTS issue_components (
    issue_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    PRIMARY KEY (issue_id, component_id)
);

-- Issue links table
CREATE TABLE IF NOT EXISTS issue_links (
    id SERIAL PRIMARY KEY,
    source_issue_id INTEGER NOT NULL,
    target_issue_id INTEGER NOT NULL,
    link_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source_issue_id, target_issue_id, link_type)
);

-- Sub tasks table
CREATE TABLE IF NOT EXISTS sub_tasks (
    parent_issue_id INTEGER NOT NULL,
    sub_task_id INTEGER NOT NULL,
    PRIMARY KEY (parent_issue_id, sub_task_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    sprint_id INTEGER,
    type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Filters table
CREATE TABLE IF NOT EXISTS filters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Gadgets table
CREATE TABLE IF NOT EXISTS gadgets (
    id SERIAL PRIMARY KEY,
    dashboard_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    role VARCHAR(100) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workflow transitions table
CREATE TABLE IF NOT EXISTS workflow_transitions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OAuth tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Change logs table
CREATE TABLE IF NOT EXISTS change_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    change_details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    expected_result TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    issue_id INTEGER,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test executions table
CREATE TABLE IF NOT EXISTS test_executions (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER NOT NULL,
    executed_by INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    actual_result TEXT NOT NULL,
    notes TEXT,
    environment VARCHAR(100) DEFAULT 'Development',
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Default assignees table
CREATE TABLE IF NOT EXISTS default_assignees (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    assignee_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, issue_type)
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE projects ADD CONSTRAINT fk_projects_lead FOREIGN KEY (lead_user_id) REFERENCES users(id);
ALTER TABLE project_users ADD CONSTRAINT fk_project_users_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_users ADD CONSTRAINT fk_project_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE issues ADD CONSTRAINT fk_issues_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE issues ADD CONSTRAINT fk_issues_assignee FOREIGN KEY (assignee_id) REFERENCES users(id);
ALTER TABLE issues ADD CONSTRAINT fk_issues_reporter FOREIGN KEY (reporter_id) REFERENCES users(id);
ALTER TABLE issues ADD CONSTRAINT fk_issues_epic FOREIGN KEY (epic_id) REFERENCES issues(id);
ALTER TABLE sprints ADD CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE sprint_issues ADD CONSTRAINT fk_sprint_issues_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE;
ALTER TABLE sprint_issues ADD CONSTRAINT fk_sprint_issues_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE;
ALTER TABLE default_assignees ADD CONSTRAINT fk_default_assignees_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE default_assignees ADD CONSTRAINT fk_default_assignees_user FOREIGN KEY (assignee_id) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprint_issues_sprint ON sprint_issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_issues_issue ON sprint_issues(issue_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_project_users_project ON project_users(project_id);
CREATE INDEX IF NOT EXISTS idx_project_users_user ON project_users(user_id);