import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalProjects: 2,
      totalIssues: 5,
      totalUsers: 3,
      activeUsers: 1,
      openIssues: 2,
      inProgressIssues: 2,
      closedIssues: 1,
      completedIssues: 1,
      activeIssues: 4,
      completionRate: 20,
      highPriorityIssues: 1,
      mediumPriorityIssues: 2,
      lowPriorityIssues: 2
    }
  })
}