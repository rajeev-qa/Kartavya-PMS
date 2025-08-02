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