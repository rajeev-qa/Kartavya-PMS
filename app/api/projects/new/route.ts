import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      form_fields: {
        name: '',
        key: '',
        description: '',
        lead_id: null
      },
      users: [
        { id: 1, username: 'admin', email: 'admin@kartavya.com' },
        { id: 2, username: 'john', email: 'john@example.com' },
        { id: 3, username: 'jane', email: 'jane@example.com' }
      ]
    }
  })
}