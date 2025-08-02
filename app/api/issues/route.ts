import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for issues
let issues = [
  {
    id: 1,
    key: 'KPM-1',
    summary: 'Sample Bug Issue',
    description: 'This is a sample bug for testing',
    type: 'Bug',
    status: 'Open',
    priority: 'High',
    project_id: 1,
    assignee_id: 1,
    reporter_id: 1,
    assignee: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    key: 'KPM-2',
    summary: 'Sample Story Issue',
    description: 'This is a sample story for testing',
    type: 'Story',
    status: 'In Progress',
    priority: 'Medium',
    project_id: 1,
    assignee_id: 2,
    reporter_id: 1,
    assignee: { id: 2, username: 'john', email: 'john@example.com' },
    reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    key: 'KPM-3',
    summary: 'Task Issue',
    description: 'This is a sample task for testing',
    type: 'Task',
    status: 'Done',
    priority: 'Low',
    project_id: 1,
    assignee_id: 3,
    reporter_id: 1,
    assignee: { id: 3, username: 'jane', email: 'jane@example.com' },
    reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    key: 'DEMO-1',
    summary: 'Demo Project Bug',
    description: 'Sample bug for demo project',
    type: 'Bug',
    status: 'Open',
    priority: 'High',
    project_id: 2,
    assignee_id: 1,
    reporter_id: 1,
    assignee: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    key: 'DEMO-2',
    summary: 'Demo Feature Story',
    description: 'Sample story for demo project',
    type: 'Story',
    status: 'In Progress',
    priority: 'Medium',
    project_id: 2,
    assignee_id: 2,
    reporter_id: 1,
    assignee: { id: 2, username: 'john', email: 'john@example.com' },
    reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextIssueId = 6

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.issues) {
    global.issues = issues
    global.nextIssueId = nextIssueId
  }
  issues = global.issues
  nextIssueId = global.nextIssueId
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const project_id = searchParams.get('project_id')
  
  let filteredIssues = issues
  
  // Filter by project_id if specified
  if (project_id) {
    filteredIssues = filteredIssues.filter(issue => issue.project_id === parseInt(project_id))
  }
  
  // Filter by type if specified
  if (type) {
    filteredIssues = filteredIssues.filter(issue => issue.type.toLowerCase() === type.toLowerCase())
  }
  
  return NextResponse.json({
    success: true,
    data: filteredIssues,
    total: filteredIssues.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { summary, description, type, priority, status, project_id } = body
    
    const newIssue = {
      id: nextIssueId++,
      key: `PROJ-${nextIssueId - 1}`,
      summary,
      description: description || '',
      type: type || 'Task',
      status: status || 'Open',
      priority: priority || 'Medium',
      project_id: project_id || 1,
      assignee_id: null,
      reporter_id: 1,
      assignee: null,
      reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    issues.push(newIssue)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.issues = issues
      global.nextIssueId = nextIssueId
    }
    
    return NextResponse.json({
      success: true,
      data: newIssue
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 400 }
    )
  }
}