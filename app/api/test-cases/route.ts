import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Login Test Case',
        description: 'Test user login functionality',
        status: 'passed',
        project_id: 1,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}