import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const project_id = searchParams.get('project_id')
  const user_id = searchParams.get('user_id')
  const start_date = searchParams.get('start_date')
  const end_date = searchParams.get('end_date')
  
  // Mock time tracking data
  const timeData = [
    {
      id: 1,
      issue_id: 1,
      issue_key: 'KPM-1',
      user_id: 1,
      user_name: 'admin',
      time_spent: 480, // minutes
      description: 'Working on bug fix',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 2,
      issue_id: 2,
      issue_key: 'KPM-2',
      user_id: 2,
      user_name: 'john',
      time_spent: 240,
      description: 'Code review',
      date: new Date().toISOString().split('T')[0]
    }
  ]
  
  return NextResponse.json({
    success: true,
    data: timeData,
    total: timeData.length,
    total_time: timeData.reduce((sum, entry) => sum + entry.time_spent, 0)
  })
}