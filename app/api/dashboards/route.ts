import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Main Dashboard',
        description: 'Default dashboard',
        is_shared: true,
        owner_id: 1,
        owner: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    data: {
      id: 2,
      name: 'New Dashboard',
      description: 'Created dashboard',
      is_shared: false,
      owner_id: 1,
      owner: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
}