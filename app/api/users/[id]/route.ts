import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the main users route
let users = []

// Global variable to track created users
if (typeof global !== 'undefined') {
  if (!global.users) {
    global.users = users
  }
  users = global.users
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const user = users.find(u => u.id === id)
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: user
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.users = users
    }
    
    return NextResponse.json({
      success: true,
      data: users[userIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    users.splice(userIndex, 1)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.users = users
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 400 }
    )
  }
}