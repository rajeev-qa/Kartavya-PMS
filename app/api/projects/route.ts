import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Kartavya PMS',
        key: 'KPM',
        description: 'Main project management system',
        lead_id: 1,
        lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}