import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Mock authentication - add more test users
    const users = {
      'admin@kartavya.com': { password: 'admin123', role: 'admin', username: 'admin' },
      'john@example.com': { password: 'john123', role: 'developer', username: 'john' },
      'jane@example.com': { password: 'jane123', role: 'developer', username: 'jane' }
    }
    
    const user = users[email as keyof typeof users]
    if (user && user.password === password) {
      return NextResponse.json({
        success: true,
        token: `mock-jwt-${Date.now()}`,
        user: {
          id: Math.floor(Math.random() * 1000),
          email,
          username: user.username,
          role: user.role,
          permissions: user.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write']
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login endpoint is working',
    method: 'POST required'
  })
}