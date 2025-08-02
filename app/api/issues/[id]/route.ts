import { NextRequest, NextResponse } from 'next/server'

// Mock issues data - in production this would be from database
const issues = [
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
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const issue = issues.find(i => i.id === id)
  
  if (!issue) {
    return NextResponse.json(
      { success: false, error: 'Issue not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: issue
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const issueIndex = issues.findIndex(i => i.id === id)
    
    if (issueIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: issues[issueIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update issue' },
      { status: 400 }
    )
  }
}