import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for search filters
let filters = []
let nextFilterId = 1

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.filters) {
    global.filters = filters
    global.nextFilterId = nextFilterId
  }
  filters = global.filters
  nextFilterId = global.nextFilterId
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: filters,
    total: filters.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, query, is_shared } = body
    
    const newFilter = {
      id: nextFilterId++,
      name,
      query,
      is_shared: is_shared || false,
      created_at: new Date().toISOString()
    }
    
    filters.push(newFilter)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.filters = filters
      global.nextFilterId = nextFilterId
    }
    
    return NextResponse.json({
      success: true,
      data: newFilter
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save filter' },
      { status: 400 }
    )
  }
}