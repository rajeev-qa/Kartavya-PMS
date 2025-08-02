import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalProjects: 1,
      totalIssues: 3,
      totalUsers: 3,
      activeUsers: 1,
      openIssues: 1,
      inProgressIssues: 1,
      closedIssues: 1,
      highPriorityIssues: 1,
      mediumPriorityIssues: 1,
      lowPriorityIssues: 1
    }
  })
}