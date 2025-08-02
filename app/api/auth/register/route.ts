import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()
    
    // Mock registration - in production, save to database
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 100,
      username,
      email,
      role: 'developer',
      permissions: ['project.view', 'issue.view', 'issue.create', 'issue.edit'],
      created_at: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      token: `mock-jwt-${Date.now()}`,
      user: newUser
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}