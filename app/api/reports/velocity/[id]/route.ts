import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id)
  
  // Mock velocity chart data
  const velocityData = {
    project_id: projectId,
    sprints: [
      { name: 'Sprint 1', completed_points: 25, committed_points: 30 },
      { name: 'Sprint 2', completed_points: 28, committed_points: 30 },
      { name: 'Sprint 3', completed_points: 32, committed_points: 35 },
      { name: 'Sprint 4', completed_points: 30, committed_points: 35 }
    ],
    average_velocity: 28.75
  }
  
  return NextResponse.json({
    success: true,
    data: velocityData
  })
}