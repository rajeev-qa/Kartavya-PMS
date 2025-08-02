import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the main projects route
let projects = [
  {
    id: 1,
    name: 'Kartavya PMS',
    key: 'KPM',
    description: 'Main project management system',
    lead_id: 1,
    lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Global variable to track created projects
if (typeof global !== 'undefined') {
  if (!global.projects) {
    global.projects = projects
  }
  projects = global.projects
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  // Find project by ID
  const project = projects.find(p => p.id === id)
  
  if (!project) {
    return NextResponse.json(
      { success: false, error: 'Project not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: project
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const updatedProject = projectStore.update(id, body)
    
    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProject
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  const deleted = projectStore.delete(id)
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Project not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    message: 'Project deleted successfully'
  })
}