import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the main sprints route
let sprints = []

// Global variable to track created sprints
if (typeof global !== 'undefined') {
  if (!global.sprints) {
    global.sprints = sprints
  }
  sprints = global.sprints
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const sprintIndex = sprints.findIndex(s => s.id === id)
    
    if (sprintIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Sprint not found' },
        { status: 404 }
      )
    }
    
    sprints[sprintIndex] = {
      ...sprints[sprintIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.sprints = sprints
    }
    
    return NextResponse.json({
      success: true,
      data: sprints[sprintIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update sprint' },
      { status: 400 }
    )
  }
}