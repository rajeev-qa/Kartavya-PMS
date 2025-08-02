import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for sprints
let sprints = []
let nextSprintId = 1

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.sprints) {
    global.sprints = sprints
    global.nextSprintId = nextSprintId
  }
  sprints = global.sprints
  nextSprintId = global.nextSprintId
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const project_id = searchParams.get('project_id')
  
  let filteredSprints = sprints
  
  // Filter by project_id if specified
  if (project_id) {
    filteredSprints = filteredSprints.filter(sprint => sprint.project_id === parseInt(project_id))
  }
  
  return NextResponse.json({
    success: true,
    data: filteredSprints,
    total: filteredSprints.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, project_id, start_date, end_date } = body
    
    const newSprint = {
      id: nextSprintId++,
      name,
      project_id: project_id || 1,
      status: 'Planning',
      start_date: start_date || null,
      end_date: end_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    sprints.push(newSprint)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.sprints = sprints
      global.nextSprintId = nextSprintId
    }
    
    return NextResponse.json({
      success: true,
      data: newSprint
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create sprint' },
      { status: 400 }
    )
  }
}