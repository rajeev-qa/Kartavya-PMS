import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the main tokens route
let tokens = []

// Global variable to track created tokens
if (typeof global !== 'undefined') {
  if (!global.tokens) {
    global.tokens = tokens
  }
  tokens = global.tokens
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const tokenIndex = tokens.findIndex(t => t.id === id)
    
    if (tokenIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      )
    }
    
    tokens.splice(tokenIndex, 1)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.tokens = tokens
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to revoke token' },
      { status: 400 }
    )
  }
}