import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sprintId = parseInt(params.id)
  
  // Mock burndown chart data
  const burndownData = {
    sprint_id: sprintId,
    total_points: 50,
    remaining_points: [50, 45, 40, 30, 25, 20, 15, 10, 5, 0],
    ideal_line: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0],
    dates: Array.from({length: 11}, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })
  }
  
  return NextResponse.json({
    success: true,
    data: burndownData
  })
}