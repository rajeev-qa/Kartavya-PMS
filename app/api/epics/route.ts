import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      summary: 'User Management Epic',
      description: 'Epic for user management features',
      project_id: 1,
      status: 'In Progress',
      created_at: new Date().toISOString()
    }
  ])
}