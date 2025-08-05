import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issueId = parseInt(params.id)
    
    // Mock attachment upload - in production, save to file storage
    return NextResponse.json({
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000),
        issue_id: issueId,
        filename: 'uploaded-file.txt',
        size: 1024,
        uploaded_at: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to upload attachment' },
      { status: 400 }
    )
  }
}