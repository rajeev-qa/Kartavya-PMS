import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for tokens
let tokens = []
let nextTokenId = 1

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.tokens) {
    global.tokens = tokens
    global.nextTokenId = nextTokenId
  }
  tokens = global.tokens
  nextTokenId = global.nextTokenId
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: tokens,
    total: tokens.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, permissions } = body
    
    const newToken = {
      id: nextTokenId++,
      name,
      token: `kpms_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: permissions || [],
      created_at: new Date().toISOString(),
      last_used: null
    }
    
    tokens.push(newToken)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.tokens = tokens
      global.nextTokenId = nextTokenId
    }
    
    return NextResponse.json({
      success: true,
      data: newToken
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create token' },
      { status: 400 }
    )
  }
}