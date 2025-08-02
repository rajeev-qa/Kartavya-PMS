import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: 'Kartavya PMS',
      key: 'KPM',
      description: 'Main project management system',
      created_at: new Date().toISOString()
    }
  ])
}