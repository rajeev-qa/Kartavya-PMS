-- Migration script to add DefaultAssignee table
-- Run this script to add the missing table without affecting existing data

-- Create default_assignees table
CREATE TABLE IF NOT EXISTS default_assignees (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    assignee_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_default_assignee_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_default_assignee_user 
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate entries
    CONSTRAINT unique_project_issue_type 
        UNIQUE (project_id, issue_type)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_default_assignees_project_id ON default_assignees(project_id);
CREATE INDEX IF NOT EXISTS idx_default_assignees_issue_type ON default_assignees(issue_type);

-- Insert some sample default assignees (optional)
-- Uncomment the following lines if you want sample data
/*
INSERT INTO default_assignees (project_id, issue_type, assignee_id) 
SELECT 
    p.id as project_id,
    'Bug' as issue_type,
    p.lead_user_id as assignee_id
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM default_assignees da 
    WHERE da.project_id = p.id AND da.issue_type = 'Bug'
)
LIMIT 5;

INSERT INTO default_assignees (project_id, issue_type, assignee_id) 
SELECT 
    p.id as project_id,
    'Story' as issue_type,
    p.lead_user_id as assignee_id
FROM projects p
WHERE NOT EXISTS (
    SELECT 1 FROM default_assignees da 
    WHERE da.project_id = p.id AND da.issue_type = 'Story'
)
LIMIT 5;
*/

-- Update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_default_assignees_updated_at 
    BEFORE UPDATE ON default_assignees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 'default_assignees table created successfully' as status;