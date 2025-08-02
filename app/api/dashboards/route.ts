import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: 'Main Dashboard',
      description: 'Default dashboard',
      is_shared: true,
      created_at: new Date().toISOString()
    }
  ])
}

export async function POST() {
  return NextResponse.json({
    id: 2,
    name: 'New Dashboard',
    description: 'Created dashboard',
    is_shared: false,
    created_at: new Date().toISOString()
  })
}