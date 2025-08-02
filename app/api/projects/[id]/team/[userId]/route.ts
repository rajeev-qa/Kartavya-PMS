import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the team route
let teamMembers = {
  1: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@kartavya.com',
      role: 'admin',
      project_role: 'Project Lead',
      joined_at: new Date().toISOString()
    }
  ]
}

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.teamMembers) {
    global.teamMembers = teamMembers
  }
  teamMembers = global.teamMembers
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const userId = parseInt(params.userId)
    
    if (!teamMembers[projectId]) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    const memberIndex = teamMembers[projectId].findIndex(m => m.id === userId)
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    teamMembers[projectId].splice(memberIndex, 1)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.teamMembers = teamMembers
    }
    
    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 400 }
    )
  }
}