import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for epics
let epics = []
let nextEpicId = 1

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.epics) {
    global.epics = epics
    global.nextEpicId = nextEpicId
  }
  epics = global.epics
  nextEpicId = global.nextEpicId
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const project_id = searchParams.get('project_id')
  
  let filteredEpics = epics
  
  // Filter by project_id if specified
  if (project_id) {
    filteredEpics = filteredEpics.filter(epic => epic.project_id === parseInt(project_id))
  }
  
  return NextResponse.json({
    success: true,
    data: filteredEpics,
    total: filteredEpics.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, summary, description } = body
    
    const newEpic = {
      id: nextEpicId++,
      summary,
      description: description || '',
      project_id: project_id || 1,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    epics.push(newEpic)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.epics = epics
      global.nextEpicId = nextEpicId
    }
    
    return NextResponse.json({
      success: true,
      data: newEpic
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create epic' },
      { status: 400 }
    )
  }
}