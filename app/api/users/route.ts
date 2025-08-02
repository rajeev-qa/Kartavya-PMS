import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for users
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@kartavya.com',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'john',
    email: 'john@example.com',
    role: 'developer',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'jane',
    email: 'jane@example.com',
    role: 'developer',
    created_at: new Date().toISOString()
  }
]

let nextUserId = 4

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.users) {
    global.users = users
    global.nextUserId = nextUserId
  }
  users = global.users
  nextUserId = global.nextUserId
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: users,
    total: users.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, role } = body
    
    const newUser = {
      id: nextUserId++,
      username,
      email,
      role: role || 'developer',
      created_at: new Date().toISOString()
    }
    
    users.push(newUser)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.users = users
      global.nextUserId = nextUserId
    }
    
    return NextResponse.json({
      success: true,
      data: newUser
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 400 }
    )
  }
}