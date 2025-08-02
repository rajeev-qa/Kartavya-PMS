import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Default Workflow',
        description: 'Standard issue workflow',
        steps: ['Open', 'In Progress', 'Review', 'Done'],
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}