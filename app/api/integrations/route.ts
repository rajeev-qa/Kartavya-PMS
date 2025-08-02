import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'GitHub Integration',
        type: 'github',
        enabled: false,
        config: {},
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}