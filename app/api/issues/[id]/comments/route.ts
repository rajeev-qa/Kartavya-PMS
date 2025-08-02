import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for comments by issue
let comments = {}
let nextCommentId = 1

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.comments) {
    global.comments = comments
    global.nextCommentId = nextCommentId
  }
  comments = global.comments
  nextCommentId = global.nextCommentId
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const issueId = parseInt(params.id)
  const issueComments = comments[issueId] || []
  
  return NextResponse.json({
    success: true,
    data: issueComments,
    total: issueComments.length
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issueId = parseInt(params.id)
    const body = await request.json()
    const { content } = body
    
    if (!comments[issueId]) {
      comments[issueId] = []
    }
    
    const newComment = {
      id: nextCommentId++,
      issue_id: issueId,
      content,
      author_id: 1,
      author: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    comments[issueId].push(newComment)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.comments = comments
      global.nextCommentId = nextCommentId
    }
    
    return NextResponse.json({
      success: true,
      data: newComment
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 400 }
    )
  }
}