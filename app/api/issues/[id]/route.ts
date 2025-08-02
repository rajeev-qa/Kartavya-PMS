import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory storage as the main issues route
let issues = []

// Global variable to track created issues
if (typeof global !== 'undefined') {
  if (!global.issues) {
    global.issues = issues
  }
  issues = global.issues
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const issue = issues.find(i => i.id === id)
  
  if (!issue) {
    return NextResponse.json(
      { success: false, error: 'Issue not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: issue
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const issueIndex = issues.findIndex(i => i.id === id)
    
    if (issueIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.issues = issues
    }
    
    return NextResponse.json({
      success: true,
      data: issues[issueIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update issue' },
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
    const issueIndex = issues.findIndex(i => i.id === id)
    
    if (issueIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }
    
    issues.splice(issueIndex, 1)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.issues = issues
    }
    
    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete issue' },
      { status: 400 }
    )
  }
}