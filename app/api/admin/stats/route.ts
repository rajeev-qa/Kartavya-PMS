import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    totalProjects: 1,
    totalIssues: 0,
    totalUsers: 3,
    activeUsers: 1
  })
}