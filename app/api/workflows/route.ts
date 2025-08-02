import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: 'Default Workflow',
      description: 'Standard issue workflow',
      steps: ['Open', 'In Progress', 'Review', 'Done'],
      created_at: new Date().toISOString()
    }
  ])
}