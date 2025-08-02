import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  const allIssues = [
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
    }
  ]
  
  // Filter by type if specified
  const filteredIssues = type ? allIssues.filter(issue => issue.type.toLowerCase() === type.toLowerCase()) : allIssues
  
  return NextResponse.json({
    success: true,
    data: filteredIssues,
    total: filteredIssues.length
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    data: {
      id: 4,
      key: 'KPM-4',
      summary: 'New Issue',
      description: 'Created via API',
      type: 'Task',
      status: 'Open',
      priority: 'Low',
      project_id: 1,
      assignee_id: null,
      reporter_id: 1,
      assignee: null,
      reporter: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
}