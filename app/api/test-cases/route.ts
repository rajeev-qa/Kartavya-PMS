import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      title: 'Login Test Case',
      description: 'Test user login functionality',
      status: 'passed',
      project_id: 1,
      created_at: new Date().toISOString()
    }
  ])
}