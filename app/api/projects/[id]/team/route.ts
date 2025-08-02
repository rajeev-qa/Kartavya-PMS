import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id)
  
  // Mock team data
  const teamMembers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@kartavya.com',
      role: 'admin',
      project_role: 'Project Lead',
      joined_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'john',
      email: 'john@example.com',
      role: 'developer',
      project_role: 'Developer',
      joined_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'jane',
      email: 'jane@example.com',
      role: 'developer',
      project_role: 'Developer',
      joined_at: new Date().toISOString()
    }
  ]
  
  return NextResponse.json({
    success: true,
    data: teamMembers,
    total: teamMembers.length
  })
}