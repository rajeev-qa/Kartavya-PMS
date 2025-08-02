import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock profile data - in production, get from JWT token
  return NextResponse.json({
    success: true,
    data: {
      id: 1,
      username: 'admin',
      email: 'admin@kartavya.com',
      role: 'admin',
      permissions: ['*'],
      created_at: new Date().toISOString()
    }
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, full_name } = body
    
    // Mock profile update
    return NextResponse.json({
      success: true,
      data: {
        id: 1,
        username: username || 'admin',
        email: email || 'admin@kartavya.com',
        full_name: full_name || 'Administrator',
        updated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 400 }
    )
  }
}