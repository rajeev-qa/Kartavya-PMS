import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])
}

export async function POST() {
  return NextResponse.json({
    id: 3,
    key: 'KPM-3',
    summary: 'New Issue',
    description: 'Created via API',
    type: 'Task',
    status: 'Open',
    priority: 'Low',
    project_id: 1,
    created_at: new Date().toISOString()
  })
}