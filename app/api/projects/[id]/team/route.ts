import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for team members by project
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id)
  const members = teamMembers[projectId] || []
  
  return NextResponse.json({
    success: true,
    data: members,
    total: members.length
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const body = await request.json()
    const { user_id, role } = body
    
    if (!teamMembers[projectId]) {
      teamMembers[projectId] = []
    }
    
    const newMember = {
      id: user_id,
      username: `user${user_id}`,
      email: `user${user_id}@example.com`,
      role: role || 'developer',
      project_role: role || 'Developer',
      joined_at: new Date().toISOString()
    }
    
    teamMembers[projectId].push(newMember)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.teamMembers = teamMembers
    }
    
    return NextResponse.json({
      success: true,
      data: newMember
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add team member' },
      { status: 400 }
    )
  }
}